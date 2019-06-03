import { sliceAndUnsetProperties } from 'utils/slicing';
import { isString, isPlainObject } from 'utils/type-inference';
import cloudinary from 'cloudinary-core';
import assign from 'utils/assign';

const normalizeOptions = (publicId, options, { tolerateMissingId = false } = {}) => {
  if (isPlainObject(publicId)) {
    const _options = assign({}, publicId);

    publicId = sliceAndUnsetProperties(_options, 'publicId').publicId;

    if (!isString(publicId) && !tolerateMissingId) {
      throw new Error('Source is missing \'publicId\'.');
    }

    if (options) {
      options = assign({}, _options, options);
    }
  }

  return { publicId, options };
};

const isSrcEqual = (source1, source2) => {
  let src1 = source1;
  let src2 = source2;

  if (typeof source1 === 'object') {
    src1 = source1.src;
  }

  if (typeof source2 === 'object') {
    src2 = source2.src;
  }

  if (/^\/\//.test(src1)) {
    src2 = src2.slice(src2.indexOf('//'));
  }
  if (/^\/\//.test(src2)) {
    src1 = src1.slice(src1.indexOf('//'));
  }

  return src1 === src2;
};

const mergeCloudinaryConfig = (config1, config2) => {
  if (config1.constructor.name === 'Cloudinary' && config1.config) {
    config1 = config1.config();
  }

  const newConfig = new cloudinary.Cloudinary(config1);

  if (config2.constructor.name === 'Cloudinary' && config2.config) {
    config2 = config1.config();
  }

  return newConfig.config(config2);
};

const mergeTransformation = (transformation1, transformation2) => {
  if (transformation1.constructor.name === 'Transformation' && transformation1.toOptions) {
    transformation1 = transformation1.toOptions();
  }

  const newTransformation = new cloudinary.Transformation(transformation1);

  return newTransformation.fromOptions(transformation2);
};

const cloudinaryErrorsConverter = (cError) => {
  let error = { code: 10, message: cError };
  let err = cError.toLowerCase();
  if (err.startsWith('unknown customer')) {
    error.code = 11;
    error.message = 'Wrong cloud name';
  }
  if (err.startsWith('resource not found')) {
    error.code = 12;
    error.message = 'Wrong video public id';
  }
  if (err.startsWith('private resource')) {
    error.code = 13;
    error.message = 'This video is private';
  }
  if (err.startsWith('unauthenticated access')) {
    error.code = 14;
  }
  return error;
};

export { normalizeOptions, isSrcEqual, mergeCloudinaryConfig, mergeTransformation, cloudinaryErrorsConverter };
