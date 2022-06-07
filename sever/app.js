const express = require("express");
const cors = require("cors");
require('dotenv').config();

// Include Stripe secret key here
const stripe = require("stripe")(process.env.SECRET_KEY);

const {v4:uuidv4}= require("uuid");

const app = express();

app.use(cors())
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server running on port 5000");
});

// Creating payment intent and fetching the responding with the client secret for the payment intent 
app.get('/client-secret', async(req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'usd',
        payment_method_types: ['card'],
    });
    res.json({client_secret: paymentIntent.client_secret});
})

// Not needed
app.post("/payment",(req,res)=>{
  const {product, token} = req.body;
  const transactionKey = uuidv4();
  return stripe.customers.create({
      email:token.email,
      source:token.id
  }).then((customer)=>{
      stripe.charges.create({
          amount:product.price,
          currency:"inr",
          customer:customer.id,
          receipt_email:token.email,
          description:product.name
      })
      .then((result)=>{
          res.json(result);
      })
      .catch((err)=>{
          console.log(err);
      });
  });
});


app.listen(5000, () => {
    console.log("Sever has been started in 5000");
});

