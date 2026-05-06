export interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  answer: number; // index of correct option
}

export interface MCQSubject {
  name: string;
  key: string;
  questions: MCQQuestion[];
}

export const mcqSubjects: MCQSubject[] = [
  {
    name: "Java",
    key: "java",
    questions: [
      { id: 1, question: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], answer: 1 },
      { id: 2, question: "What is the default value of an int variable in Java?", options: ["null", "undefined", "0", "1"], answer: 2 },
      { id: 3, question: "Which of these is NOT a Java primitive type?", options: ["int", "boolean", "String", "char"], answer: 2 },
      { id: 4, question: "What does JVM stand for?", options: ["Java Virtual Machine", "Java Variable Method", "Java Verified Module", "Java Visual Manager"], answer: 0 },
      { id: 5, question: "Which method is the entry point of a Java program?", options: ["start()", "run()", "main()", "init()"], answer: 2 },
      { id: 6, question: "Which access modifier makes a member accessible only within its class?", options: ["public", "protected", "default", "private"], answer: 3 },
      { id: 7, question: "What is the parent class of all Java classes?", options: ["Base", "Object", "Super", "Root"], answer: 1 },
      { id: 8, question: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "LinkedList", "HashSet", "Vector"], answer: 2 },
      { id: 9, question: "What is the output of: System.out.println(10 / 3)?", options: ["3.33", "3", "4", "3.0"], answer: 1 },
      { id: 10, question: "Which keyword is used to prevent method overriding?", options: ["static", "abstract", "final", "sealed"], answer: 2 },
    ],
  },
  {
    name: "Python",
    key: "python",
    questions: [
      { id: 1, question: "Which symbol is used for single-line comments in Python?", options: ["//", "/*", "#", "--"], answer: 2 },
      { id: 2, question: "What is the output of: type(3.14)?", options: ["int", "float", "double", "number"], answer: 1 },
      { id: 3, question: "Which keyword defines a function in Python?", options: ["function", "def", "fun", "define"], answer: 1 },
      { id: 4, question: "What does len([1, 2, 3]) return?", options: ["2", "3", "4", "1"], answer: 1 },
      { id: 5, question: "Which of these is an immutable data type in Python?", options: ["list", "dict", "set", "tuple"], answer: 3 },
      { id: 6, question: "What is the correct way to create a dictionary in Python?", options: ["[1:2]", "{1:2}", "(1,2)", "<1:2>"], answer: 1 },
      { id: 7, question: "Which method adds an element to the end of a list?", options: ["add()", "insert()", "append()", "push()"], answer: 2 },
      { id: 8, question: "What is the output of: 2 ** 3?", options: ["6", "8", "9", "5"], answer: 1 },
      { id: 9, question: "Which module is used for regular expressions in Python?", options: ["regex", "re", "regexp", "pattern"], answer: 1 },
      { id: 10, question: "What does 'pass' do in Python?", options: ["Exits the loop", "Does nothing", "Skips to next iteration", "Returns None"], answer: 1 },
    ],
  },
  {
    name: "Database Management System",
    key: "dbms",
    questions: [
      { id: 1, question: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0 },
      { id: 2, question: "Which SQL command retrieves data from a table?", options: ["INSERT", "UPDATE", "SELECT", "DELETE"], answer: 2 },
      { id: 3, question: "What is a primary key?", options: ["A key that can be NULL", "A key that uniquely identifies each row", "A foreign key reference", "A composite key"], answer: 1 },
      { id: 4, question: "Which normal form eliminates partial dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], answer: 1 },
      { id: 5, question: "What does ACID stand for in databases?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Index, Data", "Atomicity, Concurrency, Integrity, Durability", "Access, Consistency, Isolation, Data"], answer: 0 },
      { id: 6, question: "Which JOIN returns all rows from both tables?", options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], answer: 3 },
      { id: 7, question: "What is a foreign key?", options: ["A key from another database", "A key referencing a primary key in another table", "A unique key", "An index key"], answer: 1 },
      { id: 8, question: "Which command removes all rows from a table without deleting the table?", options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"], answer: 2 },
      { id: 9, question: "What is an index in a database?", options: ["A backup copy", "A data structure to speed up queries", "A constraint", "A view"], answer: 1 },
      { id: 10, question: "Which SQL clause filters groups after GROUP BY?", options: ["WHERE", "HAVING", "FILTER", "ORDER BY"], answer: 1 },
    ],
  },
];
