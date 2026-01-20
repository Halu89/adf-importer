# ADF Importer Forge App for Jira

This project is a Forge app for Jira that helps import and manage pages submitted to the support in Jira issues. It provides both backend and frontend functionality, including settings management, attachment linking, and more.

## Features
- **Automatic Import**: Automatically imports storage format documents (ADF - Atlassian Document Format) attached to Jira issues to Confluence pages
- **External Exports**: Allow exports to other Confluence instances with personal access token authentication
- **Macro Replacement**: Support for replacing macro environment IDs and app IDs during export to different contexts
- **Automatic Cleanup**: Automatically cleans up imported pages when:
  - Attachments are deleted from Jira issues
  - Issues are deleted
  - Issues are resolved (status changes to Resolved)
- **Settings Management**: 
  - Global settings to configure the default Confluence space for imports
  - Personal settings to configure external Confluence instance exports

## How it works

The app monitors Jira issues for attachments with specific MIME types (`text/plain` or `binary/octet-stream`). When an attachment is added:

1. The app validates that the attachment contains a valid storage format document (ADF)
2. If valid, it imports the page to the configured Confluence space (from global settings)
3. A comment with a link to the imported page is automatically added to the Jira issue
4. The link between the attachment and the imported page is stored for cleanup purposes

When attachments are deleted, issues are deleted, or issues are resolved:
- The app automatically cleans up the associated imported Confluence pages
- This prevents orphaned pages in Confluence

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
pnpm run typecheck
pnpm run lint
pnpm run lint:fix
pnpm run format
pnpm run test
```

## Quick start

- Modify your app frontend by editing files in `src/frontend/` (e.g., `src/frontend/components/`, `src/frontend/features/`).
- Modify your app backend by editing files in `src/backend/` (e.g., `src/backend/events/`, `src/backend/lib/`, `src/backend/resolvers/`).
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
- Once the app is installed on a site, the site picks up the new app changes you deploy without needing to rerun the install command for minor updates. Major upgrades like updates to permission scopes may require a manual intervention and reinstallation.
- When developing with `forge tunnel`, code changes are hot-reloaded automatically. You must redeploy and restart the tunnel if you change `manifest.yml`.

