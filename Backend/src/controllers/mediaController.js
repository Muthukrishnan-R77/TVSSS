const dbService = require('../services/dbService');
const path = require('path');

async function getMediaList(req, res, next) {
  try {
    const isAuth = Boolean(req.user);
    const publicOnly = req.query.publicOnly === 'true' || !isAuth;
    const type = req.query.type;
    const search = req.query.search;

    const list = await dbService.getAllMedia({
      isPublishedOnly: publicOnly,
      type,
      search
    });

    return res.json(list);
  } catch (err) {
    next(err);
  }
}

async function getMediaById(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const media = await dbService.getMediaById(id);
    if (!media) {
      return res.status(404).json({ success: false, message: 'Media item not found' });
    }
    return res.json(media);
  } catch (err) {
    next(err);
  }
}

async function createMedia(req, res, next) {
  try {
    const { title, shortDescription, mediaType, externalLink, publishDate, isPublished, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    let filePath = null;
    let fileName = null;
    if (req.file) {
      fileName = req.file.originalname;
      filePath = '/Uploads/media/' + req.file.filename;
    }

    const created = await dbService.createMedia({
      title,
      shortDescription,
      mediaType: mediaType || 'Image',
      fileName,
      filePath,
      thumbnailPath: mediaType === 'Image' ? filePath : null,
      externalLink,
      publishDate,
      status: status || (isPublished === 'true' || isPublished === true ? 'Published' : 'Unpublished'),
      isPublished: isPublished === 'true' || isPublished === true || status === 'Published',
      createdBy: req.user ? req.user.name : 'Admin'
    });

    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

async function updateMedia(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { title, shortDescription, mediaType, externalLink, publishDate, isPublished, status } = req.body;

    let filePath = undefined;
    let fileName = undefined;
    if (req.file) {
      fileName = req.file.originalname;
      filePath = '/Uploads/media/' + req.file.filename;
    }

    const updated = await dbService.updateMedia(id, {
      title,
      shortDescription,
      mediaType,
      fileName,
      filePath,
      externalLink,
      publishDate,
      isPublished: isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : (status ? status === 'Published' : undefined),
      status
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Media item not found' });
    }

    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteMedia(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const success = await dbService.deleteMedia(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Media item not found' });
    }
    return res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function publishMedia(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updated = await dbService.updateMedia(id, { isPublished: true, status: 'Published' });
    if (!updated) return res.status(404).json({ success: false, message: 'Media item not found' });
    return res.json({ success: true, message: 'Media published successfully', data: updated });
  } catch (err) {
    next(err);
  }
}

async function unpublishMedia(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updated = await dbService.updateMedia(id, { isPublished: false, status: 'Unpublished' });
    if (!updated) return res.status(404).json({ success: false, message: 'Media item not found' });
    return res.json({ success: true, message: 'Media unpublished successfully', data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMediaList,
  getMediaById,
  createMedia,
  updateMedia,
  deleteMedia,
  publishMedia,
  unpublishMedia
};
