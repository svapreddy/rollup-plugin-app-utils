### Contributing

Thanks for using `rollup-plugin-app-utils` and contributing to its development. Following is a initial set of guidelines designed to make your contributions smooth.

Please be aware that, tests and other parts of the repo needs some work.

#### Security Issues

If you think you've found a security vulnerability, please create an issue immediately in git repo. We will take a look immediately

#### Issues

Issues can be questions, feature requests, enhancements, optimizations and more. Please use git repo issues to inform the same.  

When filing a bug, please provide a reproducible demonstration of the bug in the form of a demo.

### Development

#### Required software

- Git
- A shell

#### Hacking rollup-plugin-app-utils

Fork the repository to your Github account by clicking the "Fork" button on the [rollup-plugin-app-utils repository page](https://github.com/Autodesk/rollup-plugin-app-utils). Then do the following:

```bash
# Clone your fork of the repo
git clone https://github.com/YOUR_USERNAME/rollup-plugin-app-utils

# Move into the repo directory
cd rollup-plugin-app-utils

# Install the dependencies
npm install

# run tests
npm run test

```

#### Testing

Tests use [AVA](https://www.npmjs.com/package/ava). Check out their documentation.

Tests can be found in the `test.js` file.

A sample test file will look like this:

```js
test ('#copyAssets()', (t) => {
  t.is(fs.existsSync('./test-data-copy'), true)
})
```

#### Guidelines

- Tests should be isolated, portable, and readable.
- Tests and assertions should be described properly.

#### Pull requests

All pull requests are welcome. To create a pull request, simply build your code on a branch using rollup-plugin-app-utils's [`master` branch](https://github.com/Autodesk/rollup-plugin-app-utils) as base. Then push that branch to your Github repo and submit a PR of that branch against rollup-plugin-app-utils's `master` branch. 

#### Contributor License Agreement

There's no contributor license agreement. Contributions are made on a common sense basis. rollup-plugin-app-utils is distributed under the MIT license, which means your contributions will be too.
