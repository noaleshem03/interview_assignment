const csvFilePath = 'data.csv';
const csv = require('csvtojson');
const trie = require('trie-prefix-tree');

const namesTrie = trie([]);
const usersByIds = {};
const usersByName = {};
const usersByCountry = {};
const usersByDOB = {};

const init = async () => {
    let jsonObj = await csv().fromFile(csvFilePath);
    jsonObj.forEach(function (item) {
        //map users by id
        usersByIds[item.Id] = item;

        // map users by name into maps and prefix tree
        let nameArray = item.Name.split(" ");
        let first = nameArray[0].toLowerCase();
        let last = nameArray[1].toLowerCase();
        //save the names in prefix tree
        namesTrie.addWord(first);
        namesTrie.addWord(last);
        // save the users by names
        if (usersByName[first] === undefined)
            usersByName[first] = [];
        usersByName[first] = usersByName[first].concat([item]);
        if (usersByName[last] === undefined)
            usersByName[last] = [];
        usersByName[last] = usersByName[last].concat([item]);

        // map users by country
        if (usersByCountry[item.Country] === undefined)
            usersByCountry[item.Country] = [];
        usersByCountry[item.Country] = usersByCountry[item.Country].concat([item]);

        // map users by dob
        if (usersByDOB[item.DOB] === undefined)
            usersByDOB[item.DOB] = [];
        usersByDOB[item.DOB] = usersByDOB[item.DOB].concat([item]);
    });
};

init();

module.exports = {
    getUserById: async function (id) {
        console.log(`getUserById called with id: ${id}`);
        return usersByIds[id];
    },

    getUsersByAge: async function (age) {
        console.log(`getUsersByAge called with age: ${age}`);
        //low is the lowest birth date for user to be *age* years old
        let low = new Date();
        low.setFullYear(low.getFullYear() - age - 1);
        low.setDate(low.getDate() + 1);

        //high is the highest birth date for user to be *age* years old
        let high = new Date();
        high.setFullYear(high.getFullYear() - age);

        let res = [];
        //iterate all birth dates that user can have to be *age* years old
        while (low <= high) {
            let year = low.getFullYear().toString();
            let month = (low.getMonth() + 1).toString();
            let day = low.getDate().toString();
            let dob = day + "/" + month + "/" + year;
            //concat all users with this DOB
            res = res.concat(usersByDOB[dob]);
            low.setDate(low.getDate() + 1);
        }
        return res;
    },

    getUsersByCountry: async function (country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        return usersByCountry[country];
    },

    getUsersByName: async function (name) {
        console.log(`searchUsersByName called with name: ${name}`);
        name = name.toLowerCase();
        //namesArr is array of all names that match to the query (full/partial match)
        let namesArr = namesTrie.getPrefix(name);
        let res = [];
        for (let i = 0; i < namesArr.length; i++) {
            //concat all users with that name (first/last)
            res = res.concat(usersByName[namesArr[i]]);
        }
        return res;
    },

    deleteUser: async function (id) {
        console.log(`deleteUser called with id: ${id}`);
        let country = usersByIds[id].Country;
        let dob = usersByIds[id].DOB;
        let nameArray = usersByIds[id].Name.split(" ");
        let first = nameArray[0].toLowerCase();
        let last = nameArray[1].toLowerCase();

        usersByCountry[country] = usersByCountry[country].filter(x => x.Id !== id);
        usersByDOB[dob] = usersByDOB[dob].filter(x => x.Id !== id);
        usersByName[first] = usersByName[first].filter(x => x.Id !== id);
        usersByName[last] = usersByName[last].filter(x => x.Id !== id);

        if (usersByName[first] === [])
            namesTrie.removeWord(first);
        if (usersByName[last] === [])
            namesTrie.removeWord(last);
        usersByIds[id] = {};
    }
}
