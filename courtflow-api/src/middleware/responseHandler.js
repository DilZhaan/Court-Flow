const buildSuccessResponse = ({ message, data, meta }) => ({
  success: true,
  message,
  data,
  meta,
});

const responseHandler = (req, res, next) => {
  res.success = (data, message = "Success", meta = undefined) =>
    res.status(200).json(buildSuccessResponse({ message, data, meta }));

  res.created = (data, message = "Created") =>
    res.status(201).json(buildSuccessResponse({ message, data }));

  res.noContent = () => res.status(204).send();

  next();
};

export default responseHandler;
