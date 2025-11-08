import express from "express";
import { protect } from "../middleware/auth.js";
import { permit } from "../middleware/roles.js";
import * as eventsCtrl from "../controllers/eventController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "/tmp/uploads" }); 

router.post("/create", protect, permit("Admin", "Organizer"), upload.array("attachments"), eventsCtrl.createEvent);
router.get("/", protect, eventsCtrl.listEvents);
router.get("/:id", protect, eventsCtrl.getEvent);
router.put("/:id", protect, permit("Admin", "Organizer"), upload.array("attachments"), eventsCtrl.updateEvent);
router.delete("/:id", protect, permit("Admin", "Organizer"), eventsCtrl.deleteEvent);
router.put("/:id/invite", protect, eventsCtrl.inviteParticipants);

router.post("/:id/rsvp", protect, eventsCtrl.rsvp);

export default router;
