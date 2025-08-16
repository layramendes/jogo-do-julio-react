// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// A linha problemática que estava aqui foi removida.

admin.initializeApp();

exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // A inicialização do Stripe foi MOVIDA para AQUI DENTRO.
  const stripe = require("stripe")(functions.config().stripe.secret);

  // Garante que o utilizador está autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to make a purchase."
    );
  }

  const { priceId, success_url, cancel_url } = data;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: success_url,
      cancel_url: cancel_url,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: context.auth.uid,
    });

    return { id: session.id };

  } catch (error) {
    console.error("Stripe session creation failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Could not create Stripe checkout session."
    );
  }
});