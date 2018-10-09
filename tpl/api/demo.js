__api_annotation__
export function __api_name__(data) {
  return _fetch({
    url: __url__,
    method: __method__,
    data: data,
    headers: __headers__
  });
}