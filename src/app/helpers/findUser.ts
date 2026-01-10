export function findData(query: Record<string, any>, filterableFields: string[]) {
    const {
        page,
        limit,
        sortBy,
        sortOrder,
        searchTerm,
        ...rest
    } = query;

    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;
    const filters: Record<string, any> = {};
    filterableFields.forEach(field => {
        if (rest[field]) {
            filters[field] = rest[field];
        }
    });

    return { pageNumber, limitNumber, skip, rest, searchTerm, filters, sortBy, sortOrder }

}