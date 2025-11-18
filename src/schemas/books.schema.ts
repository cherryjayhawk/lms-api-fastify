const bookProperties = {
  _id: { type: "string" },
  title: { type: "string" },
  author: { type: "string" },
  isbn: { type: "string" },
  publisher: { type: "string" },
  publishedYear: { type: "integer" },
  category: { type: "string" },
  description: { type: "string" },
  coverImage: { type: "string" },
  totalStock: { type: "integer" },
  availableStock: { type: "integer" },
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const createBookSchema = {
  tags: ["Books"],
  consumes: ["multipart/form-data"],

  body: {
    type: "object",
    required: ["title", "author", "isbn", "totalStock", "availableStock"],
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      isbn: { type: "string" },
      publisher: { type: "string" },
      publishedYear: { type: "string" },
      category: { type: "string" },
      description: { type: "string" },
      totalStock: { type: "string" },
      availableStock: { type: "string" },
      coverImage: { type: "string", format: "binary" },
    },
  },

  response: {
    201: {
      type: "object",
      properties: bookProperties,
    },
  },
};

const updateBookSchema = {
  tags: ["Books"],
  consumes: ["multipart/form-data"],

  params: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "string" },
    },
  },

  body: {
    type: "object",
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      isbn: { type: "string" },
      publisher: { type: "string" },
      publishedYear: { type: "string" },
      category: { type: "string" },
      description: { type: "string" },
      totalStock: { type: "string" },
      availableStock: { type: "string" },
      coverImage: { type: "string", format: "binary" },
    },
  },

  response: {
    200: {
      type: "object",
      properties: bookProperties,
    },
  },
};

const getBookByIdSchema = {
  tags: ["Books"],

  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string" } },
  },

  response: {
    200: {
      type: "object",
      properties: bookProperties,
    },
  },
};

const getBooksQuerySchema = {
  tags: ["Books"],

  querystring: {
    type: "object",
    properties: {
      search: { type: "string" },
      category: { type: "string" },
      page: { type: "string" },
      limit: { type: "string" },
    },
  },

  response: {
    200: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "object", properties: bookProperties },
        },
        pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
          },
        },
      },
    },
  },
};

const deleteBookSchema = {
  tags: ["Books"],

  params: {
    type: "object",
    required: ["id"],
    properties: { id: { type: "string" } },
  },

  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  },
};

export {
  getBookByIdSchema,
  getBooksQuerySchema,
  createBookSchema,
  updateBookSchema,
  deleteBookSchema,
};
