export const getPopulateQueryParamOneLevel = (populate: string[]): string => {
  let query = '';
  populate.map((item, index) => {
    query += `${!!index ? '&' : ''}populate[${item}]=true`;
  });
  return query;
}
export const getPopulateQueryParam = (populate: string[]): string => {
  let query = '';
  populate.map((item, index) => {
    query += `${!!index ? '&' : ''}populate[${index}]=${item}`;
  });
  return query;
}
export const getSortQueryParam = (sort: string[]): string => {
  let query = '';
  sort.map((item, index) => {
    query += `${!!index ? '&' : ''}sort[${index}]=${item}`;
  });
  return query;
}
export const getQueryStringPopulateOneLevel = (queryArray: Array<string>, populateArray?: Array<string>, additionalQueryParams?: string, sortArray?: Array<string>, pagination?: string): string => {
  return getQueryString(queryArray, populateArray, additionalQueryParams, sortArray, pagination, true);
}
export const getQueryString = (queryArray: Array<string>, populateArray?: Array<string>, additionalQueryParams?: string, sortArray?: Array<string>, pagination?: string, populateOneLevel = false): string => {
  if (!!populateArray?.length) {
    queryArray.push(populateOneLevel ? getPopulateQueryParamOneLevel(populateArray) : getPopulateQueryParam(populateArray));
  }
  if (!!additionalQueryParams) {
    queryArray.push(additionalQueryParams);
  }
  if (!!sortArray?.length) {
    queryArray.push(getSortQueryParam(sortArray));
  }
  if (!!pagination) {
    queryArray.push(pagination);
  }
  return queryArray.length ? '?' + queryArray.join('&') : '';
}

export const getUserPopulateQueryParam = (): string => {
  return '?populate=role' +
    '&populate=klubr_membres.klubr.logo' +
    '&populate=klubr_membres.klubr.trade_policy' +
    '&populate=klubr_membres.klubr.klubrAffiliations' +
    '&populate=klubr_membres.klubr.federationLink' +
    '&populate=klubr_membres.avatar' +
    '&populate=klubr_membres.klubr.template_projects_libraries' +
    '&populate=klubr_membres.klubr.klubr_info';
}

export const getFullPopulateQueryParam = (isFullPopulated: boolean): string => {
  // to be replaced later when we add http service  layer to the ap
  if (isFullPopulated) {
    return '?populate=*';
  }
  return '';
}

export const pagination = (page: number, pageSize = 10): string => {
  return `pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
}

export const sort = (sort: Array<{ field: string, order: 'asc' | 'desc' }>): string => {
  let query = '';
  sort.map((item, index) => {
    query += `${!!index ? '&' : ''}sort[${index}]=${item.field}:${item.order}`;
  });
  return query;
}

export const addFilter = (element: string | Array<string>, filter: string, value: string) => {
  if (Array.isArray(element) && element.length > 0) {
    return `filters${element.map((el) => '[' + el + ']').join('')}[${filter}]=${value}`;
  }
  return `filters[${element}][${filter}]=${value}`;
}

export const addSubElementFilter = (element: string, subElement: string, filters: string, value: string): string => {
  return `filters[${element}][${subElement}][${filters}]=${value}`;
}
export const addSubSubElementFilter = (element: string, subElement: string, subSubElement: string, filters: string, value: string): string => {
  return `filters[${element}][${subElement}][${subSubElement}][${filters}]=${value}`;
}

export const addGreaterEqualFilter = (element: string, greater: string) => {
  return `filters[${element}][$gte]=${greater}`;
}
export const addGreaterLessFilter = (element: string, greater: string, less: string) => {
  return `filters[${element}][$gte]=${greater}&filters[${element}][$lte]=${less}`;
}
export const formatDate = (date: Date, isRange: boolean): string => {
  if (isRange) {
    date.setDate(date.getDate() + 1);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const formatingDate = (dates: (Date)[]): string[] => {

  const firstDate = formatDate(dates[0], false);
  if (dates[1] === null) {
    const secondDate = new Date(dates[0].setDate(dates[0].getDate() + 1));
    return [firstDate, formatDate(secondDate, false)];
  } else {
    return [firstDate, formatDate(dates[1], true)];
  }
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters
    .trim() // Remove leading and trailing spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

export const getRandomDigitString = (length = 3) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}
