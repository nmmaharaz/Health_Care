export function findData(query: Record<string, any>, filterableFields: string[], searchableFields: string[]) {
    const {
        page,
        limit,
        sortBy,
        sortOder,
        searchTerm,
        ...rest
    } = query;

    // pagination
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const filters: Record<string, any> = {};
    filterableFields.forEach(field => {
        // console.log(filters, "field")
        if (rest[field]) {
            filters[field] = rest[field];
        }
    });

    const where = {
        AND: {
            OR: searchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive",
                },
            })),
            AND: Object.keys(filters).map(key => (
                {
                    [key]: filters[key],
                })),
        }
    }

    return { pageNumber, limitNumber, skip, rest, searchTerm, sortBy, sortOder, filters, where }

}