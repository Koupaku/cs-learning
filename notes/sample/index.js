
console.log("Hello, World!");  //教学介绍对象和对象操作

const person = {  //person为一个对象
    firstname: `john`,  //firstname为对象的属性，john为属性值
    lastname: `doe`,
    age:30,
    hobbies: [`reading`, `traveling`, `coding`], //对象可以包含数组，数组中可以包含多个值
    address: {                                  //对象可以包含另一个对象
        street: `123 Main St`, 
        city: `Anytown`,
        state: `CA`,
    },
}
console.log(person); //输出整个person对象

console.log(person.firstname); //对象可以通过点符号访问属性值
console.log(person.hobbies[0]); //对象的数组属性可以通过索引访问数组中的值
console.log(person.address.city); //对象的嵌套对象属性可以通过多级点符号访问

const {hobbies,
    lastname,
    address: {city, state},
} = person; //对象的解构赋值可以将对象的属性值赋给变量
console.log(hobbies); //可以直接输出person对象的hobbies属性值
console.log(state); //可以直接输出person对象的嵌套对象address的state属性值
console.log(person); //输出整个person对象 解构赋值不会改变原对象

person.email = `john.doe@example.com`; //可以通过点符号为对象添加新的属性
console.log(person); //输出更新后的person对象


//and more......