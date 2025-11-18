export const loanSchemas = {
  Loan: {
    type: "object",
    properties: {
      _id: { type: "string" },
      userId: { type: "string" },
      bookId: { type: "string" },
      borrowDate: { type: "string", format: "date-time" },
      dueDate: { type: "string", format: "date-time" },
      returnDate: { type: "string", nullable: true, format: "date-time" },
      status: {
        type: "string",
        enum: ["active", "returned", "returned_late"],
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
      book: { type: "object" },
      user: { type: "object" },
    },
  },

  CreateLoanDTO: {
    type: "object",
    required: ["bookId"],
    properties: {
      bookId: { type: "string", description: "ID of book to loan" },
      dueDate: {
        type: "string",
        nullable: true,
        format: "date-time",
        description: "Optional due date (defaults to +14 days)",
      },
    },
  },
};

const getAllLoansSchema = {
  tags: ["Loans"],
  querystring: {
    type: "object",
    properties: {
      status: { type: "string" },
      page: { type: "number", default: 1 },
      limit: { type: "number", default: 10 },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        data: { type: "array", items: loanSchemas.Loan },
        pagination: {
          type: "object",
          properties: {
            page: { type: "number" },
            limit: { type: "number" },
            total: { type: "number" },
            totalPages: { type: "number" },
          },
        },
      },
    },
  },
};

const getLoanByIdSchema = {
  tags: ["Loans"],
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: loanSchemas.Loan,
    404: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const createLoanSchema = {
  tags: ["Loans"],
  body: loanSchemas.CreateLoanDTO,
  response: {
    201: loanSchemas.Loan,
    400: {
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const updateLoanSchema = {
  tags: ["Loans"],
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
  },
  response: {
    200: {
      type: "object",
      properties: {
        value: loanSchemas.Loan,
      },
    },
    400: {
      type: "object",
      properties: { error: { type: "string" } },
    },
  },
};

const getLoansByUserSchema = {
  tags: ["Loans"],
  params: {
    type: "object",
    properties: {
      userId: { type: "string" },
    },
  },
  response: {
    200: {
      type: "array",
      items: loanSchemas.Loan,
    },
  },
};

export {
  getAllLoansSchema,
  getLoanByIdSchema,
  createLoanSchema,
  updateLoanSchema,
  getLoansByUserSchema,
};
