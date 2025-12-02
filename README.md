# ADF Importer Forge App for Jira

This project is a Forge app for Jira that helps import and manage pages submitted to the support in Jira issues. It provides both backend and frontend functionality, including settings management, attachment linking, and more.

## Features
- Automatically import storage format documents attached to Jira issues to the Confluence
- Allow exports to other Confluence instances. Allow replacements for the macro environment ids

## App documentation

### Manage your global and personal settings

![Manage app settings in a Jira space](/documentation/assets/settings.png)

### Export page to an external Confluence instance
 - External exports require a personal access token to make authenticated requests to the Confluence REST API
 - Create a new token at https://id.atlassian.com/manage-profile/security/api-tokens
 - Your email must match the email address used to create the token
 - Retrieve your space id from the Confluence REST API

![Export to an external instance](/documentation/assets/exports.png)


## Development

### Installation
This project uses [pnpm](https://pnpm.io)

1. Install pnpm

Using npm
```sh
npm install -g pnpm
```

Using homebrew
```sh
brew install pnpm
```

2. Install dependencies

```sh
pnpm install
```

3. Typecheck, lint, formatting, tests
```sh
# Run the scripts from the package.json:
pnpm run test
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run test
```

## Quick start

- Modify your app frontend by editing files in `src/frontend/` (e.g., `src/frontend/components/`, `src/frontend/features/`).
- Modify your app backend by editing files in `src/` (e.g., `src/events/`, `src/lib/`, `src/resolvers/`).
- Build and deploy your app by running:
  ```sh
  forge deploy
  ```
- Install your app in an Atlassian site by running:
  ```sh
  forge install
  ```
- Develop your app by running `forge tunnel` to proxy invocations locally:
  ```sh
  forge tunnel
  ```

See [developer.atlassian.com/platform/forge/](https://developer.atlassian.com/platform/forge) for documentation and tutorials explaining Forge.

See [Set up Forge](https://developer.atlassian.com/platform/forge/set-up-forge/) for instructions to get set up.

### Notes
- Use the `forge deploy` command when you want to persist code changes.
- Use the `forge install` command when you want to install the app on a new site.
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command for minor updates. Major upgrades like updates to permission scopes may require a manual intervention.

