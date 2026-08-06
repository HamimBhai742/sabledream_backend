import { prisma } from "../../lib/prisma";
import config from "../../config";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

// Map Product ID to plan name, cost, and frequency
const PRODUCT_PLAN_MAP: Record<string, { name: string; type: "monthly" | "annual"; amount: number }> = {
  monthly_divine: {
    name: "Monthly — Divine",
    type: "monthly",
    amount: 5.0,
  },
  annual_becoming: {
    name: "Annual — Becoming",
    type: "annual",
    amount: 45.0,
  },
};

// Formatting utilities for Billing History to match the Figma UI perfectly
const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const minutesStr = minutes < 10 ? "0" + minutes : minutes;
  return `${hours}:${minutesStr}${ampm}`;
};

const padZero = (num: number): string => {
  return num < 10 ? "0" + num : String(num);
};

const formatDate = (date: Date): string => {
  // Return format DD.MM.YY (e.g. 12.11.23)
  const day = padZero(date.getDate());
  const month = padZero(date.getMonth() + 1);
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const getPlanMeta = (productId: string | null) => {
  if (!productId) return null;
  // Match exact mapping or try to guess based on ID containing monthly/annual
  if (PRODUCT_PLAN_MAP[productId]) {
    return PRODUCT_PLAN_MAP[productId];
  }
  const isAnnual = productId.toLowerCase().includes("annual") || productId.toLowerCase().includes("year");
  return {
    name: isAnnual ? "Annual — Premium" : "Monthly — Premium",
    type: isAnnual ? ("annual" as const) : ("monthly" as const),
    amount: isAnnual ? 45.0 : 5.0,
  };
};

const toDateFromMs = (value: unknown): Date | null => {
  if (value === null || value === undefined) return null;
  const ms =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(ms)) return null;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const SubscriptionService = {
  /**
   * Fetch subscription info for a user. Mapped to Figma design specifications.
   */
  async getSubscriptionDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const sub = user.subscription;

    // Check if subscription has expired based on expiry date
    let status: "active" | "trial" | "expired" = "expired";
    let hasActivePremium = false;

    if (sub && sub.status !== "expired" && sub.expiresDate) {
      const now = new Date();
      if (sub.expiresDate > now) {
        status = sub.status as "active" | "trial";
        hasActivePremium = true;
      }
    }

    const planMeta = sub ? getPlanMeta(sub.productId) : null;

    // Build Figma UI mapping response
    return {
      status,
      currentPlan: {
        name: planMeta ? planMeta.name : "Free Tier",
        type: planMeta ? planMeta.type : "free",
        productId: sub?.productId || null,
        expiresAt: sub?.expiresDate || null,
      },
      billingDetails: {
        nextBillingAmount: hasActivePremium && planMeta ? planMeta.amount : null,
        nextBillingDate: hasActivePremium ? sub?.expiresDate || null : null,
        paymentMethod: sub?.paymentMethod || "App Store",
      },
      hasActivePremium,
    };
  },

  /**
   * Get billing history for the Figma "Billing history" screen.
   */
  async getBillingHistory(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return transactions.map((tx) => {
      const isRefund = tx.type === "refund";
      const sign = isRefund ? "+" : "-";
      return {
        id: tx.id,
        name: tx.name || "User",
        phone: tx.phone || "N/A",
        transactionId: tx.transactionId,
        amount: tx.amount,
        formattedAmount: `${sign}$${Math.abs(tx.amount).toFixed(2)}`,
        time: formatTime(tx.createdAt),
        date: formatDate(tx.createdAt),
        createdAt: tx.createdAt,
      };
    });
  },

  /**
   * Sync a subscriber's state manually using RevenueCat REST API
   */
  async syncRevenueCatSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const apiKey = config.revenueCat.apiKey;
    if (!apiKey) {
      throw new AppError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "RevenueCat API key is not configured in backend env variables"
      );
    }

    // Call RevenueCat GET subscriber API
    const response = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new AppError(
        httpStatus.BAD_GATEWAY,
        `RevenueCat API error: ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as any;
    const subscriber = data.subscriber;

    if (!subscriber) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Invalid response payload from RevenueCat");
    }

    // Determine the user's highest active entitlement
    const entitlements = subscriber.entitlements || {};
    let activeEntitlementKey: string | null = null;
    let activeEntitlement: any = null;

    for (const key of Object.keys(entitlements)) {
      const entitlement = entitlements[key];
      const expiresDateStr = entitlement.expires_date;
      if (expiresDateStr) {
        const expiresDate = new Date(expiresDateStr);
        if (expiresDate > new Date()) {
          activeEntitlementKey = key;
          activeEntitlement = entitlement;
          break; // Found an active entitlement
        }
      } else {
        // Lifetime or no expiry
        activeEntitlementKey = key;
        activeEntitlement = entitlement;
        break;
      }
    }

    if (activeEntitlementKey && activeEntitlement) {
      const productId = activeEntitlement.product_identifier;
      const planMeta = getPlanMeta(productId);
      const isTrial = activeEntitlement.period_type === "trial";
      const status = isTrial ? "trial" : "active";
      const planType = planMeta ? planMeta.type : "free";

      const subscriptionData = {
        status: status as any,
        planType: planType as any,
        productId,
        expiresDate: activeEntitlement.expires_date ? new Date(activeEntitlement.expires_date) : null,
        purchaseDate: activeEntitlement.purchase_date ? new Date(activeEntitlement.purchase_date) : null,
        originalPurchaseDate: activeEntitlement.original_purchase_date
          ? new Date(activeEntitlement.original_purchase_date)
          : null,
        paymentMethod: subscriber.subscriptions?.[productId]?.store || "App Store",
        revenueCatUserId: userId,
      };

      // Upsert Subscription
      await prisma.subscription.upsert({
        where: { userId },
        update: subscriptionData,
        create: {
          userId,
          ...subscriptionData,
        },
      });

      // Synchronize Transactions if they are available in the RevenueCat payload
      const subscriptions = subscriber.subscriptions || {};
      const subDetails = subscriptions[productId];
      if (subDetails && subDetails.store_transaction_id) {
        const txId = subDetails.store_transaction_id;
        const txAmount = planMeta ? planMeta.amount : 0.0;
        
        await prisma.transaction.upsert({
          where: { transactionId: txId },
          update: {
            status: "success",
          },
          create: {
            userId,
            transactionId: txId,
            amount: txAmount,
            status: "success",
            name: user.name,
            phone: user.phone || null,
            type: "charge",
          },
        });
      }
    } else {
      // Exited or has no active entitlements, mark as expired
      const expiredData = {
        status: "expired" as const,
        planType: "free" as const,
        productId: null,
        expiresDate: null,
        purchaseDate: null,
        nextBillingAmount: null,
        nextBillingDate: null,
      };

      await prisma.subscription.upsert({
        where: { userId },
        update: expiredData,
        create: {
          userId,
          ...expiredData,
        },
      });
    }

    return this.getSubscriptionDetails(userId);
  },

  /**
   * Process an incoming webhook from RevenueCat
   */
  async handleRevenueCatWebhook(payload: any) {
    const event = payload.event;
    if (!event) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid webhook structure: Missing 'event' object.");
    }

    const eventType = event.type;
    const userId = event.app_user_id;

    if (!userId) {
      console.warn("[RevenueCat Webhook] Warning: Missing app_user_id in event.");
      return { success: false, message: "Missing app_user_id" };
    }

    // Retrieve the user from our database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`[RevenueCat Webhook] Warning: User with ID ${userId} not found in our database. Skipping update.`);
      return { success: false, message: "User not found in local database" };
    }

    const productId = event.product_id;
    const planMeta = getPlanMeta(productId);
    const expiresDate = toDateFromMs(event.expiration_at_ms);
    const purchaseDate = toDateFromMs(event.purchased_at_ms);
    const originalPurchaseDate = toDateFromMs(event.original_purchased_at_ms);
    const store = event.store || "App Store";

    let status: "active" | "trial" | "expired" = "expired";
    let planType: "free" | "monthly" | "annual" = "free";

    // Standardize event types
    switch (eventType) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "PRODUCT_CHANGE":
      case "UNCANCELLATION":
        const isTrial = event.period_type === "TRIAL";
        status = isTrial ? "trial" : "active";
        planType = planMeta ? planMeta.type : "free";
        break;

      case "NON_RENEWING_PURCHASE":
        // Non-renewing purchases can still have an expiration; treat as active while not expired.
        if (expiresDate && expiresDate > new Date()) {
          status = "active";
          planType = planMeta ? planMeta.type : "free";
        } else {
          status = "expired";
          planType = "free";
        }
        break;

      case "EXPIRATION":
        status = "expired";
        planType = "free";
        break;

      case "CANCELLATION":
        // Auto-renew was turned off, but standard practice is to keep access until the expiration date.
        // Let's verify if the expiresDate is in the future.
        if (expiresDate && expiresDate > new Date()) {
          const isTrialCancel = event.period_type === "TRIAL";
          status = isTrialCancel ? "trial" : "active";
          planType = planMeta ? planMeta.type : "free";
        } else {
          status = "expired";
          planType = "free";
        }
        break;

      case "BILLING_ISSUE":
        // Subscriptions that fail renewal will transition to expired (or grace period, which we simplify to expired for now)
        status = "expired";
        planType = "free";
        break;

      default:
        // For other events (e.g. SUBSCRIBER_ALIAS, TRANSFER), let's keep current state or skip
        return { success: true, message: `Skipping unmapped event type: ${eventType}` };
    }

    const subscriptionData = {
      status,
      planType,
      productId: status === "expired" ? null : productId,
      expiresDate,
      purchaseDate,
      originalPurchaseDate,
      paymentMethod: store,
      revenueCatUserId: userId,
    };

    // Upsert the subscription
    await prisma.subscription.upsert({
      where: { userId },
      update: subscriptionData,
      create: {
        userId,
        ...subscriptionData,
      },
    });

    // Create a transaction record for charges or refunds
    if (event.transaction_id && event.price !== undefined) {
      const txId = event.transaction_id;
      const amount = event.price;
      const type = eventType === "CANCELLATION" && event.cancel_reason === "UNSUBSCRIBE" ? "charge" : 
                   (eventType === "CANCELLATION" ? "refund" : "charge");

      await prisma.transaction.upsert({
        where: { transactionId: txId },
        update: {
          status: "success",
        },
        create: {
          userId,
          transactionId: txId,
          amount: amount,
          status: "success",
          name: user.name,
          phone: user.phone || null,
          type,
        },
      });
    }

    return { success: true, message: `Successfully handled event: ${eventType}` };
  },
};
