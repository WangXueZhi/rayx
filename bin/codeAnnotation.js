let codeAnnotation = {};

/**
 * 选出注释的文本
 * @param {*} text 文件文本
 */
codeAnnotation.unwrap = function (text) {
    if (!text) { return ''; }

    // note: keep trailing whitespace for @examples
    // extra opening/closing stars are ignored
    // left margin is considered a star and a space
    // use the /m flag on regex to avoid having to guess what this platform's newline is
    text =
        // remove opening slash+stars
        text.replace(/^\/\*\*+/, '')
            // replace closing star slash with end-marker
            .replace(/^\s*(\*\/)/gm, '')
            // remove left margin like: spaces+star or spaces+end-marker
            .replace(/^\s*(\* ?|\\Z)/gm, '')
            // remove end-marker
            .replace(/\s*\\Z$/g, '');

    return text;
}

/**
 * 把注释文本转成对象
 * @param {*} text 注释文本
 */
codeAnnotation.toObject = function (text) {
    var parsedTag;
    var tagData = [];
    var tagText;
    var tagTitle;
    let obj = {};

    // split out the basic tags, keep surrounding whitespace
    // like: @tagTitle tagBody
    text
        // replace splitter ats with an arbitrary sequence
        .replace(/^(\s*)@(\S)/gm, '$1\\@$2')
        // then split on that arbitrary sequence
        .split('\\@')
        .forEach(function ($) {
            if ($) {
                parsedTag = $.match(/^(\S+)(?:\s+(\S[\s\S]*))?/);

                if (parsedTag) {
                    tagTitle = parsedTag[1];
                    tagText = parsedTag[2];
                    if (!parsedTag[2]) {
                        tagTitle = "title";
                        tagText = parsedTag[1];
                    }
                    tagText = tagText.replace(/[\n|\r]/g, "");

                    if (tagTitle) {
                        if (obj[tagTitle]) {
                            if (typeof obj[tagTitle] == "string") {
                                let oldValue = obj[tagTitle];
                                obj[tagTitle] = [oldValue];
                                obj[tagTitle].push(tagText);
                            } else if (Array.isArray(obj[tagTitle])) {
                                obj[tagTitle].push(tagText);
                            }
                        } else {
                            obj[tagTitle] = tagText;
                        }
                    }
                }
            }
        });

    return obj;
}

/**
 * 把文件文本内容中的注释转成对象
 * @param {*} text 文件文本
 */
codeAnnotation.translateToObject = function(text){
    if (!text) { return ''; }
    return codeAnnotation.toObject(codeAnnotation.unwrap(text))
}

module.exports = codeAnnotation;