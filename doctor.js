const Subject = require("../models/subject");

exports.getSubjects = (req, res, next) => {
  const { userId } = req.body;
  Subject.findAll({
    where: { doctorId: userId },
    attributes: ["id", "name", "code"],
  })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      err.statusCode = 500;
      next(err);
    });
};

exports.addFile = (req, res, next) => {
  res.status(200).json({ message: "File has been uploaded successfully." });
};
