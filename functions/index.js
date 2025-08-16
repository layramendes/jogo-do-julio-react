// functions/index.js
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const express = require("express");
// Use secrets stored as environment variables for 2nd Gen functions
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

admin.initializeApp();

const app = express();

// Stripe requires the raw request body to verify webhook signatures.
// We use express.raw() instead of express.json() for this specific endpoint.
app.post("/", express.raw({type: "application/json"}), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    // Use the environment variable for the webhook secret.
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        logger.error("Stripe webhook secret is not set.");
        return res.sendStatus(400);
    }
    // req.body contains the raw buffer from express.raw()
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed.", {
        error: err.message,
    });
    return res.sendStatus(400);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const coins = session.metadata.coins;

      if (!userId || !coins) {
        logger.error("Missing userId or coins in session metadata", {session});
        return res.status(400).send("Missing required session data.");
      }

      // Fulfill the purchase
      try {
        const userRef = admin.firestore().collection("users").doc(userId);
        await userRef.update({
          coins: admin.firestore.FieldValue.increment(parseInt(coins, 10)),
        });
        logger.info(`Successfully granted ${coins} coins to user ${userId}`);
      } catch (error) {
        logger.error(`Error updating coins for user ${userId}:`, error);
        return res.status(500).send("Error fulfilling purchase.");
      }
      break;
    }
    default:
      logger.warn(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({received: true});
});

// Expose the Express app as a single Cloud Function.
// Any request to the 'stripeWebhook' function will be handled by our app.
exports.stripeWebhook = onRequest(app);
