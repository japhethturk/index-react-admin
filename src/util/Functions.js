export const Functions = {
    slug(text) {
        let search = [
            '’', ' - ', '?', '(', ')', '\'', ' ', '/', '*', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '{', '}', '"', '\\', '`', '~',
            'i', 'ğ', 'Ğ', 'ə', 'Ə', 'I', 'İ', 'ı', 'I', 'ö', 'Ö', 'ç', 'Ç', 'ş', 'Ş', 'ü', 'Ü', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            'а', 'б', 'в', 'г', 'д', 'е', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ь', 'ю', 'я', 'э', 'ё', 'ы',
            'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ь', 'Ю', 'Я', 'Э', 'Ё', 'Ы'
        ];
        let replacement = [
            '', '-', '', '', '', '', '-', '-', '-', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
            'i', 'g', 'g', 'e', 'e', 'i', 'i', 'i', 'i', 'o', 'o', 'c', 'c', 's', 's', 'u', 'u', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sht', 'a', 'y', 'yu', 'ya', 'e', 'yo', 'i',
            'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sht', 'a', 'y', 'yu', 'ya', 'e', 'yo', 'i'
        ];
        for (let i = 0; i < search.length; i++) {
            text = text.split(search[i]).join(replacement[i]);
        }
        return text;
    },
    htmlToText(str){
        return str.replace(/<[^>]*>?/gm, '');
    },
    cipher(salt) {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
        const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

        return text => text.split('')
            .map(textToChars)
            .map(applySaltToChar)
            .map(byteHex)
            .join('');
    },
    decipher(salt) {
        const textToChars = text => text.split('').map(c => c.charCodeAt(0));
        const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
        return encoded => encoded.match(/.{1,2}/g)
            .map(hex => parseInt(hex, 16))
            .map(applySaltToChar)
            .map(charCode => String.fromCharCode(charCode))
            .join('');
    },
    axiosJsonHeader() {
        return  {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        };
    },
    axiosJsonTokenHeader(token) {
        return  {
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        };
    },
    axiosMultipartHeader(token){
        return  {
            headers: {
                'Content-Type' : 'multipart/form-data',
                "Authorization": `Bearer ${token}`
            }
        };
    },
    axiosMultipartHeaderBoundary(token){
        return  {
            headers: {
                'Content-Type' : `multipart/form-data; charset=utf-8; boundary=${Math.random().toString().substr(2)}`,
                "Authorization": `Bearer ${token}`
            }
        };
    },
    findCategory (categories, key) {
        var trail = [];
        var found = false;
        function recurse(categoryAry) {
            for (var i = 0; i < categoryAry.length; i++) {
                trail.push(categoryAry[i].key);
                // Found the category!
                if ((categoryAry[i].key === key)) {
                    found = true;
                    break;
                    // Did not match...
                } else {
                    // Are there children / sub-categories? YES
                    if (categoryAry[i].children.length > 0) {
                        recurse(categoryAry[i].children);
                        if(found){
                            break;
                        }
                    }
                }
                trail.pop();
            }
        }
        recurse(categories);
        return trail
    },
    subName (limit, str) {
        const oldLength = str.length;
        if (oldLength>limit){
            return str.substring(0, limit)+'...';
        } else {
            return str;
        }
    },
    clone (data) {return JSON.parse(JSON.stringify(data))},
    setting(settings, key, r = ''){
        let callcenter = settings.find(item => item.key === key)
        if(callcenter === undefined) {
            return r
        } else {
            return callcenter.value
        }
    },
    isEmpty(obj) {return Object.keys(obj).length === 0;},
    isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n);},
    limitedString(str, limit){
        if (limit < str.length) {
            return str.substr(0, limit) + "..."
        } else {
            return str
        }
    },
    percentage(mPrice, mOldPrice){
        let price = parseFloat(mPrice)
        let oldPrice = parseFloat(mOldPrice)
        if (!isNaN(price) && !isNaN(oldPrice)) {
            if (oldPrice === null || oldPrice === 0 || price >= oldPrice) {
                return 0
            } else {
                let discount = oldPrice-price;
                return  ((discount/price) * 100).toFixed(0);
            }
        } else
            return 0
    },
    uniqid(){
        // always start with a letter (for DOM friendliness)
        let idString=String.fromCharCode(Math.floor((Math.random()*25)+65));
        do {
            // between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
            let ascicode=Math.floor((Math.random()*42)+48);
            if (ascicode<58 || ascicode>64){
                // exclude all chars between : (58) and @ (64)
                idString+=String.fromCharCode(ascicode);
            }
        } while (idString.length<32);

        return (idString);
    },
    isTrue(element) {
        if (element === undefined)
            return false
        else if (element === null)
            return false
        else if (element === false)
            return false
        else
            return true
    },

};