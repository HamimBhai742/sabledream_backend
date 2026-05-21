import admin from "firebase-admin";
// const serviceAccount = {
//   "type": "service_account",
//   "project_id": "sable-dreams",
//   "private_key_id": "2a74ad0c6a6ff29ea95bef07a13ab510e4789ee5",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDCod+VqphedXLy\ny1ZLsRhPhXJoRdq5HzoD+25lY1dyn9p1iZXotmYkMoRygP696cDjpqBmcQ6xdNk/\nwDr3+VVcrdmN2MvzCbbLwmYhwv1zeEjE4mZ2tzGfaXtZUFKECE2mP6JTj2eBrUu2\n5b+bMofotudsjX9RvZIRx9U9TmL0GONlRQD1AQCeBET7DUKcyzJmfjA0DFOQjSYr\nr7GcycrZElIbRvRe0MaOKkmNTII4rWp9FS5u26m+SvjKeoWqCEocKsxTyqJ1lr3p\nVHcVCoXhRc2VcsXFvR48Onm5He8sj6ilIwXD20kaWNGnDbhluYjAaoZZOWxvwHiX\n4MfvjH+LAgMBAAECggEABSUrWHUIjyKytblrYBff6SZBdoE2PYOWUImiivqb0rNo\nHohTFrJPs/BD8RT45wNZbos2nU6q0UUiAx3tUSXdvFP6NtY+2f9tPii283iIo7dP\n0SidBdFk9e5fbOaDL+taRiVTgLr/RP3UTRL4xD0LO7suFgANmBcXV/H88KB0XDiK\nWJJkICS+OJNnSOfsD/sYkDs5PtF4+3ul6f3IZkhJbBSdZy90H9JnsUhDBje09WrD\nuERji/7cWP8SP7vV/ECVFULyD+MNqBdwxpXV8K5hxFmDiU5B+qQ0QWpHg54tPKf8\nb39TL0VaQA77T/MyzDB9dOKNS+DXmGX3Th6NCL75bQKBgQD30U5RjWXtNBJVHF1R\n6y7gQvB4zMQQl7+K9oDNEJXqGmf4eEasvG2kB8OeVg5t9EjmANXoTvCiM6iep8TW\nYFhfoJYBjHcuPWD1fiaviFBoJdEDPCK/8FjzgW1wiqddPH7AGQIvy5lE7bMFFRb8\no1ok6S7OqOzFtxgQeNu3CS15fwKBgQDJDwP0Z7L1qpK5X5SI54VWTUEaxKLxon11\nuqiEo75NS+v1oWWZh0SxiEE9SGw6qtVjdJ8NONU6Ye+69klOsRnH+fJYE9Uek0qPBt\nd209dl3+TF7dSgysrFwhCJfZ/H2vJU1Bk8YCIweli40kRx69n3U8xpvPkBEIW3vm\nX1Fv3itH9QKBgQCnF/Tj3iBUwSB/TMHLg3U290unWAH3Yipfq3gLTNyYXbeu/IJC\n5EZVLHsE3ueZ0fX5R6Tzn452/7f5SgvZtFrCF8gtQSX3AqHGxYmWH6Z/osf8k2am\n3otLnQBKuuLAZhLcucAUtAYjSNbFXYQDUq1sZ+IMrDAB3EOYj7UuBD0qRwKBgQCd\nniDajCT2hCcMHcsC3IViF6QvSPH4fgrerVsIyJkaXad4Y3OTvUBz8L48Pbdi8qPg\nmP9LYkU7ytFAB6KUptxBthQwLzOkLcB2AIbqBQ5AmjxQPIndIC4FU4g/wroBATwk\naaVz7WREOjeGth56RzSQVZ62RFml9JoYCqd8DG5ftQKBgQDYdOY53w4KMi2tsyz3\nOzxV3TzlxxtKnT0FMRo0UYUVTnGM9gOJDhUSS1ClaQ1Xb88sAnb9i76lajiKDM2b\n0vFhUaEqr1cgx3CSo62yWdlAMJZrzJA90OQMcopE2CQdoHv2ibVMaNVwfVScImC3\n1eJsQlwsRDe+IpEOT6n5OaTBcg==\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-fbsvc@sable-dreams.iam.gserviceaccount.com",
//   "client_id": "109930911186615154118",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40sable-dreams.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }
const serviceAccount = {

}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export const fcm = admin.messaging();

