__api_annotation__
exports.__api_name__ = function (options) {
  return network.request({
    method: __method__,
    url: __url__,
    data: options.data || {},
    header: options.header || {}
  })
}