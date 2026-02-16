import { Op } from "sequelize";

export const paginate = async (model, options = {}) => {
  const {
    where = {},
    order = [
      ["createdAt", "DESC"],
      ["id", "ASC"],
    ],
    attributes,
    include,
    limit = 10,
    page = 1,
    search,
    searchFields = [],
  } = options;

  const parsedLimit = Number.parseInt(limit, 10);
  const parsedPage = Number.parseInt(page, 10);

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    throw new Error("Invalid limit parameter");
  }

  if (isNaN(parsedPage) || parsedPage <= 0) {
    throw new Error("Invalid page parameter");
  }

  let queryWhere = { ...where };

  // Handle search functionality
  if (search && searchFields.length > 0) {
    const searchConditions = searchFields.map((field) => ({
      [field]: {
        [Op.like]: `%${search}%`,
      },
    }));

    queryWhere = {
      ...queryWhere,
      [Op.and]: [
        queryWhere,
        {
          [Op.or]: searchConditions,
        },
      ],
    };
  }

  // Calculate offset for pagination
  const offset = (parsedPage - 1) * parsedLimit;

  const queryOptions = {
    where: queryWhere,
    order,
    limit: parsedLimit,
    offset,
    attributes,
    include,
    raw: options.raw || false,
  };

  // Execute query to get items and total count
  const { count, rows } = await model.findAndCountAll(queryOptions);

  // Calculate pagination details
  const totalPages = Math.ceil(count / parsedLimit);
  const hasNextPage = parsedPage < totalPages;
  const hasPrevPage = parsedPage > 1;

  return {
    items: rows,
    pagination: {
      currentPage: parsedPage,
      totalPages,
      totalItems: count,
      itemsPerPage: parsedLimit,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? parsedPage + 1 : null,
      prevPage: hasPrevPage ? parsedPage - 1 : null,
    },
  };
};
