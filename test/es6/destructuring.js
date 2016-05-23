'use strict';

const person = {firstName: 'John', lastName: 'Doe'};
const {firstName: name, lastName} = person;

console.log(name, lastName);

const person2 = {firstName2: 'John', lastName2: ['Doe', 'Avery']};

const {firstName2, lastName2: [a, b]} = person2;
console.log(firstName2, a, b);

//Destructuring Function Arguments
function getName(name, {firstName, lastName}) {
  console.log(name, firstName, lastName);
}
getName('jason jiang', {firstName: 'jason', lastName: 'jiang'});
