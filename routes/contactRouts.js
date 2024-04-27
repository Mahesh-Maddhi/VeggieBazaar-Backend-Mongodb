import Contact from "../models/Contact.js";
// import { authenticateUser } from "./auth";
import { router } from "./routes.js";

router.get("/contact/getMessages/:email", async (req, res) => {
  const { email } = req.params;
  console.log(email);
  try {
    const user = await Contact.findOne({ email: email });
    console.log("user :", user);
    if (user) {
      console.log("in user");
      const messages = user?.messages;
      console.log("msgs", messages);
      if (messages.length > 0) {
        res.send({ message: "Messages found", messages: messages });
      } else {
        res.send({ message: "Messages not found", messages: [] });
      }
    } else {
      res.send({ message: "user not found", messages: [] });
    }
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/contact/addMessage", async (req, res) => {
  const { name, email, subject, message } = req.body;
  console.log("req-body", req.body);

  try {
    let contact = await Contact.findOne({ email });
    console.log("checking-contact", contact);
    if (!contact) {
      contact = new Contact({
        name,
        email,
        messages: [
          {
            subject,
            message,
          },
        ],
      });
    } else {
      contact.messages.push({ subject, message });
    }
    console.log("contact :", contact);

    await contact.save();
    res.status(200).json({ message: `${subject} added successfully!` });
  } catch (error) {
    console.error(`Database query error: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
