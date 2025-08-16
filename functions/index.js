const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Inicialize os serviços apenas uma vez
admin.initializeApp();
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: "2023-10-16",
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;
  const webhookSecret = functions.config().stripe.webhook_secret;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      webhookSecret
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, coinAmount } = session.metadata;

    if (!userId || !coinAmount) {
      console.error("❌ Metadata (userId or coinAmount) missing in session:", session.id);
      return res.status(400).send("Error: Missing required metadata.");
    }

    const playerDocRef = admin.firestore().collection("players").doc(userId);

    try {
      await playerDocRef.update({
        coins: admin.firestore.FieldValue.increment(parseInt(coinAmount, 10)),
      });

      console.log(`✅ Successfully credited ${coinAmount} coins to user ${userId}`);
      res.status(200).json({ received: true, message: "Coins credited." });

    } catch (error) {
      console.error(`🔥 Failed to update coins for user ${userId}:`, error);
      res.status(500).send("Internal Server Error: Could not update player data.");
    }
  } else {
    res.status(200).send({ received: true, message: `Unhandled event type: ${event.type}` });
  }
});