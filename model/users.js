const csvFilePath='data.csv';
const csv=require('csvtojson');
const id_to_user = {};
const name_to_user = {};
const country_to_user = {};
const age_to_user = {};
csv().fromFile(csvFilePath).then((jsonObj)=>{
    jsonObj.map(function(item){
        //map users by id
        id_to_user[item.Id] = item;

        //map users by name
        let name_arr = item.Name.split(" ");
        let first = name_arr[0].substring(0, 3).toUpperCase();
        let last = name_arr[1].substring(0, 3).toUpperCase();
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

        //map users by age
        let age = calc_age(item.DOB);
        if (age_to_user[age] === undefined)
            age_to_user[age] = [];
        age_to_user[age] = age_to_user[age].concat([item]);
    });
})
 
 function calc_age(dob_str){
     let dob_arr = dob_str.split("/");
     let day = Number(dob_arr[0]);
     let month = Number(dob_arr[1]) - 1;
     let year = Number(dob_arr[2]);
     let dob = new Date(year, month, day);
     let dates_dif = Date.now() - dob.getTime();
     let age_date = new Date(dates_dif);
     return Math.abs(age_date.getUTCFullYear() - 1970);
 }

module.exports = {
    getUserById: async function(id){
        console.log(`getUserById called with id: ${id}`);
        return id_to_user[id];
    },

    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        return age_to_user[age];
    },

    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        return country_to_user[country];
    },

    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);
        name = name.substring(0, 3).toUpperCase();
        return name_to_user[name];
    },

    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);
        let country = id_to_user[id].Country;
        let age = calc_age(id_to_user[id].DOB);
        let name_arr = id_to_user[id].Name.split(" ");
        let first = name_arr[0].substring(0, 3).toUpperCase();
        let last = name_arr[1].substring(0, 3).toUpperCase();
        country_to_user[country] = country_to_user[country].filter(x => x.Id !== id);
        age_to_user[age] = age_to_user[age].filter(x => x.Id !== id);
        name_to_user[first] = name_to_user[first].filter(x => x.Id !== id);
        name_to_user[last] = name_to_user[last].filter(x => x.Id !== id);
        id_to_user[id] = {};
        return;
    }
}

