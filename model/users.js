const csvFilePath='data.csv';
const csv=require('csvtojson');
const trie = require('trie-prefix-tree');
const names_trie = trie([]);
const id_to_user = {};
const name_to_user = {};
const country_to_user = {};
const age_to_user = {};
const dob_to_user = {};
csv().fromFile(csvFilePath).then((jsonObj)=>{
    jsonObj.map(function(item){
        //map users by id
        id_to_user[item.Id] = item;

        //map users by name into maps and prefix tree
        let name_arr = item.Name.split(" ");
        let first = name_arr[0].toLowerCase();
        let last = name_arr[1].toLowerCase();
        //save the names in prefix tree
        names_trie.addWord(first);
        names_trie.addWord(last);
        //save the users by names
        if (name_to_user[first] === undefined)
            name_to_user[first] = [];
        name_to_user[first] = name_to_user[first].concat([item]);
        if (name_to_user[last] === undefined)
            name_to_user[last] = [];
        name_to_user[last] = name_to_user[last].concat([item]);

        //map users by country
        if (country_to_user[item.Country] === undefined)
            country_to_user[item.Country] = [];
        country_to_user[item.Country] = country_to_user[item.Country].concat([item]);  

        //map users by dob
        if (dob_to_user[item.DOB] === undefined)
            dob_to_user[item.DOB] = [];
        dob_to_user[item.DOB] = dob_to_user[item.DOB].concat([item]);
    });
}) 

module.exports = {
    getUserById: async function(id){
        console.log(`getUserById called with id: ${id}`);
        return id_to_user[id];
    },

    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        //low_range is the lowest birth date for user to be *age* years old
        let low_range = new Date();
        low_range.setFullYear(low_range.getFullYear() - age - 1);
        low_range.setDate(low_range.getDate() + 1);

        //high_range is the highest birth date for user to be *age* years old
        let high_range = new Date();
        high_range.setFullYear(high_range.getFullYear() - age);
        let res = [];

        //iterate all birth dates that user can have to be *age* years old 
        while (low_range <= high_range){
            let year = low_range.getFullYear().toString();
            let month = (low_range.getMonth() + 1).toString();
            let day = low_range.getDate().toString();
            let dob = day + "/" + month + "/" + year;
            //concat all users with this DOB
            res = res.concat(dob_to_user[dob]);
            low_range.setDate(low_range.getDate() + 1);
        }
        return res;
    },

    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        return country_to_user[country];
    },

    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);
        name = name.toLowerCase();
        //names_arr is array of all names that match to the query (full/partial match)
        let names_arr = names_trie.getPrefix(name);
        let res = [];
        for (let i=0; i<names_arr.length; i++){
            //concat all users with that name
            res = res.concat(name_to_user[names_arr[i]]);
        }
        return res;
    },

    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);
        let country = id_to_user[id].Country;
        let dob = id_to_user[id].DOB;
        let name_arr = id_to_user[id].Name.split(" ");
        let first = name_arr[0].toLowerCase();
        let last = name_arr[1].toLowerCase();

        country_to_user[country] = country_to_user[country].filter(x => x.Id !== id);
        dob_to_user[dob] = dob_to_user[dob].filter(x => x.Id !== id);
        name_to_user[first] = name_to_user[first].filter(x => x.Id !== id);
        name_to_user[last] = name_to_user[last].filter(x => x.Id !== id);
        if (name_to_user[first] === [])
            names_trie.removeWord(first);
        if (name_to_user[last] === [])
            names_trie.removeWord(last);
        id_to_user[id] = {};
        return;
    }
}

