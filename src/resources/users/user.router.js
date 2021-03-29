const { OK, NO_CONTENT } = require('http-status-codes');
const router = require('express').Router();
const moment = require('moment');
const fs = require('fs/promises');
const cloudinary = require('cloudinary').v2;

const userService = require('./user.service');
const { id, user } = require('../../utils/validation/schemas');
const {
  validator,
  userIdValidator
} = require('../../utils/validation/validator');

router.post('/', validator(user, 'body'), async (req, res) => {
  let userPhoto = '';
  if (req.files) {
    const file = req.files.imagine;
    const date = moment().format('DDMMYYYY-HHmmss_SSS');
    const fileFormat = file.name.split('.').pop();
    file.name = `${date}.${fileFormat}`;
    const pathimg = `./tmp/${file.name}`;
    file.mv(pathimg, err => {
      if (err) {
        return res.status(200).json({ message: 'фото не загружено' });
      }
    });

    const result = await cloudinary.uploader.upload(pathimg, {
      upload_preset: 'rslang'
    });
    fs.unlink(pathimg);
    userPhoto = result.secure_url;
    console.log(result);
  }
  const userEntity = await userService.save({ ...req.body, userPhoto });
  res.status(OK).send(userEntity.toResponse());
});

router.get(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  async (req, res) => {
    const userEntity = await userService.get(req.params.id);
    res.status(OK).send(userEntity.toResponse());
  }
);

router.put(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  validator(user, 'body'),
  async (req, res) => {
    const userEntity = await userService.update(req.userId, req.body);
    res.status(OK).send(userEntity.toResponse());
  }
);

router.delete(
  '/:id',
  userIdValidator,
  validator(id, 'params'),
  async (req, res) => {
    await userService.remove(req.params.id);
    res.sendStatus(NO_CONTENT);
  }
);

module.exports = router;
