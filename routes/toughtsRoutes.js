const express = require("express");
const router = express.Router();
const ToughtController = require("../controllers/ToughtController");

const checkAuth = require("../helpers/auth").checkAuth;

router.get("/add", checkAuth, ToughtController.createTought);
router.post("/add", checkAuth, ToughtController.createToughtSave);
router.get("/dashboard", checkAuth, ToughtController.dashboards);
router.post("/remove", checkAuth, ToughtController.removeTought);
router.get("/edit/:id", checkAuth, ToughtController.updateTougth);
router.post("/edit", checkAuth, ToughtController.updateTougthSave);
router.get("/", ToughtController.showToughts);

module.exports = router;
