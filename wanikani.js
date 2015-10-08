/*
The MIT License (MIT)

Copyright (C) 2015 Daniel Esteban - conejo@conejo.me

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/

var ajax = require('ajax');

var wanikani = {
    apikey: "",
    base_path: "https://www.wanikani.com/api/v1.4/user/",



    setAPIKey: function(apikey) {
        console.log("SET API KEY : " + apikey);
        this.apikey = apikey;
    },

    addEventListener: function(e, f) {
        if(this.isValidEvent(e)) {
            this[e] = f;
        }
    },

    removeEventListener: function(e) {
        if(this.isValidEvent(e)) {
            this[e] = null;
        }
    },

    isValidEvent: function(e) {
        return [
        'onUserInformation',
            'onStudyQueue',
            'onLevelProgression',
            'onSRSDistribution',
            'onRecentUnlocks',
            'onCriticalItems',
            'onRadicals',
            'onKanji',
            'onVocabulary'].indexOf(e)!=-1;
    },

    _onUserInformation : function(data) {
        if (this.onUserInformation!=null) {
            data = this._addInterface(data, WanikaniUserInterface);
            this.onUserInformation(data)
        }
    },

    _onCriticalItems : function(data) {
        if (this.onCriticalItems!=null) {

            var words = [];
            if(data.requested_information!=null && (Array.isArray(data.requested_information) || data.requested_information instanceof Object)) {
                for(w in data.requested_information) {
                    words.push(this._addInterface(data.requested_information[w], WanikaniWordInterface));
                }
            }
            data = this._addInterface(data, WanikaniListInterface);
            data.setWords(words);
            this.onCriticalItems(data);
        }
    },

    _onRecentUnlocks : function(data) {
        print_obj(data);
        if (this.onRecentUnlocks!=null) {

            var words = [];
            if(data.requested_information!=null && (Array.isArray(data.requested_information) || data.requested_information instanceof Object)) {
                for(w in data.requested_information) {
                    words.push(this._addInterface(data.requested_information[w], WanikaniWordInterface));
                }
            }
            data = this._addInterface(data, WanikaniListInterface);
            data.setWords(words);
            this.onRecentUnlocks(data);
        }
    },

    userInformation : function() {
        this._call("user-information", "_onUserInformation");
    },

    studyQueue : function() {
        this._call("study-queue", "_onStudyQueue");
    },

    levelProgression : function() {
        this._call("level-progression", "_onLevelProgression");
    },

    SRSDistribution : function() {
        this._call("srs-distribution", "_onSRSDistribution");
    },

    recentUnlocks : function(limit) {
        // limit 1-100
        limit = limit || 10;
        limit = Math.min(Math.max(limit, 1), 100);
        this._call("recent-unlocks/" + limit, "_onRecentUnlocks");
    },

    criticalItems : function(percentage) {
        // percentage 0-100
        percentage = percentage || 75;
        percentage = Math.min(Math.max(percentage, 0), 100);
        this._call("critical-items/" + percentage, "_onCriticalItems");
    },

    radicals : function(levels) {
        // levels "" or 1,2,5,7,8
        levels = levels || "";
        this._call("radicals/" + levels, "_onRadicals");
    },

    kanji : function(levels) {
        // levels "" or 1,2,5,7,8
        levels = levels || "";
        this._call("kanji/" + levels, "_onKanji");
    },

    vocabulary : function(levels) {
        // levels "" or 1,2,5,7,8
        levels = levels || "";
        this._call("vocabulary/" + levels, "_onVocabulary");
    },


    _call : function(method, callback) {
        console.log("CALL " + method + " " + callback);
        ajax(
            {
                url: this.base_path + this.apikey + "/" + method,
                type:'json'
            },
            function(data) {
                if (wanikani[callback]==null) {
                    wanikani._defaultCallback(data);
                } else {
                    wanikani[callback](data);
                }
                console.log("DATA OK");
            },
            function(error) {
                console.log('DATA FAILED: ' + error);
            }
        );

    },



    _addInterface : function(obj, interf) {
        var i;
        for(i in interf) {
            obj[i] = interf[i];
        }
        return obj;
    },



    _defaultCallback: function(data) { console.log("DEFAULT CALLBACK");console.log(data); },
    onUserInformation: null,
    onStudyQueue: null,
    onLevelProgression: null,
    onSRSDistribution: null,
    onRecentUnlocks: null,
    onCriticalItems: null,
    onRadicals: null,
    onKanji: null,
    onVocabulary: null
};

function print_obj(data, depth) {
    if(Array.isArray(data) || data instanceof Object) {
        console.log(depth + "{");
        for(i in data) {
            if(Array.isArray(data[i]) || data[i] instanceof Object) {
                console.log(depth + i + ": {" );
                print_obj(data[i], depth + "  ");
                console.log(depth + "}" );
            } else {
                console.log(depth + i + ":" + data[i]);

            }
        }
        console.log(depth + "}");
    } else {
        console.log(depth + data);
    }
}



var WanikaniUserInterface = {
    getUsername : function() {
        return this.user_information.username || "";
    },
    getGravatar : function() {
        return this.user_information.gravatar || "";
    },
    getLevel : function() {
        return this.user_information.level || 1;
    },
    getTitle : function() {
        return this.user_information.title || "";
    },
    getAbout : function() {
        return this.user_information.about || "";
    },
    getWebsite : function() {
        return this.user_information.website || "";
    },
    getTwitter : function() {
        return this.user_information.twitter || "";
    },
    getTopicsCount : function() {
        return this.user_information.topics_count || 0;
    },
    getPostsCount : function() {
        return this.user_information.posts_count || 0;
    },
    getCreationDate : function() {
        return this.user_information.creation_date || 0;
    },
    getVacationDate : function() {
        return this.user_information.vacation_date || 0;
    }
};


var WanikaniListInterface = {
    words: [],
    wIndex: 0,
    setWords : function(words) {
        this.words = words;
        this.wIndex = -1;
    },
    nextWord: function() {
        if(this.words.length==0) {
            return [];
        }
        this.wIndex++;
        if(this.wIndex>=this.words.length) {
            this.wIndex = 0;
        }
        return this.words[this.wIndex];
    },
    prevWord: function() {
        if(this.words.length==0) {
            return [];
        }
        this.wIndex--;
        if(this.wIndex<0) {
            this.wIndex = this.words.length-1;
        }
        return this.words[this.wIndex];
    },
    randomWord: function() {
        this.wIndex = Math.floor(Math.random() * this.words.length);
        return this.words[this.wIndex];
    },
    getWords: function () {
        return this.words || [];
    },
    shuffleWords: function() {
        this.words = this._shuffle(this.words);
    },
    getTotalWords: function() {
        return this.getWords().length;
    },


    _shuffle: function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
    }
};

var WanikaniWordInterface = {
    getType : function() {
        return this.type || "";
    },
    getCharacter : function() {
        return this.character || "";
    },
    getKana : function() {
        return this.kana || "";
    },
    getMeaning : function() {
        return this.meaning || "";
    },
    getLevel : function() {
        return this.level || 0;
    },
    getPercentage : function() {
        return this.percentage || 0;
    },
    getShortMeaning : function() {
        return this.getMeaning().split(",")[0];
    }
};


module.exports = wanikani;
