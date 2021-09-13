# dependabot-terraform-action
Github Action for generating dependabot configuration in terraform repository


## How to update this code
We use a tool called @vercel/ncc to compile your code and modules into one file used for distribution (dist/index.js).

1. Install vercel/ncc by running this command in your terminal. 
    ```sh
    npm i -g @vercel/ncc
    ```
2. Compile index.js file. 
    ```sh
    ncc build index.js --license licenses.txt
    ```
