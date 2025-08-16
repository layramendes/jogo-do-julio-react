// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

admin.initializeApp();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = functions.config().stripe.webhook_secret;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const {userId, coinAmount} = session.metadata;

    if (!userId || !coinAmount) {
      console.error("Missing metadata: userId or coinAmount");
      return res.status(400).send("Error: Missing metadata.");
    }

    const playerDocRef = admin.firestore().collection("players").doc(userId);

    try {
      // Use FieldValue.increment to safely add coins
      await playerDocRef.update({
        coins: admin.firestore.FieldValue.increment(parseInt(coinAmount, 10)),
      });
      console.log(`Successfully credited ${coinAmount} coins to user ${userId}`);
      res.status(200).json({received: true});
    } catch (error) {
      console.error("Failed to update player coins:", error);
      res.status(500).send("Error updating player data.");
    }
  } else {
    res.status(200).send(`Unhandled event type: ${event.type}`);
  }
});