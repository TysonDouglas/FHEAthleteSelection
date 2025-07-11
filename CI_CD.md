# CI/CD Documentation

Comprehensive Continuous Integration and Continuous Deployment guide for the Anonymous Athlete Selection System.

## Table of Contents

- [Overview](#overview)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Setup Instructions](#setup-instructions)
- [Workflow Details](#workflow-details)
- [Code Quality Checks](#code-quality-checks)
- [Codecov Integration](#codecov-integration)
- [Secrets Configuration](#secrets-configuration)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses GitHub Actions for automated CI/CD pipelines, ensuring code quality, testing, and deployment automation.

### CI/CD Features

- ✅ **Automated Testing** on multiple Node.js versions (18.x, 20.x)
- ✅ **Multi-OS Support** (Ubuntu and Windows)
- ✅ **Code Quality Checks** (Linting, Formatting, Security)
- ✅ **Code Coverage** with Codecov integration
- ✅ **Automated Deployment** to Sepolia testnet
- ✅ **Contract Verification** on Etherscan

### Workflow Triggers

All workflows automatically run on:
- ✅ Push to `main` branch
- ✅ Push to `develop` branch
- ✅ Pull requests to `main` and `develop`

## GitHub Actions Workflows

### 1. Test Suite (`.github/workflows/test.yml`)

**Purpose**: Automated testing across multiple environments

**Runs on**:
- Node.js versions: 18.x, 20.x
- Operating Systems: Ubuntu, Windows
- Triggers: Push and Pull Requests

**Steps**:
1. Checkout code
2. Setup Node.js with caching
3. Install dependencies (`npm ci`)
4. Compile contracts (`npm run compile`)
5. Run tests (`npm test`)
6. Generate coverage report (`npm run coverage`)
7. Upload coverage to Codecov (Ubuntu 20.x only)

**Status Badge**:
```markdown
![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)
```

---

### 2. Code Quality (`.github/workflows/code-quality.yml`)

**Purpose**: Ensure code quality standards

**Jobs**:

#### Lint Job
- Prettier formatting check
- JavaScript linting (ESLint)
- Solidity linting (Solhint)

#### Security Job
- NPM security audit
- Vulnerability scanning

**Status Badge**:
```markdown
![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)
```

---

### 3. Deploy (`.github/workflows/deploy.yml`)

**Purpose**: Manual deployment to networks

**Trigger**: Manual workflow dispatch

**Options**:
- Network selection (Sepolia or Localhost)

**Steps**:
1. Compile contracts
2. Deploy to selected network
3. Verify on Etherscan (Sepolia only)
4. Upload deployment artifacts

**Usage**:
1. Go to Actions tab on GitHub
2. Select "Deploy" workflow
3. Click "Run workflow"
4. Choose network
5. Run workflow

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions is enabled by default for public repositories. For private repositories:

1. Go to repository **Settings**
2. Navigate to **Actions** > **General**
3. Enable **Allow all actions and reusable workflows**

### 2. Configure Secrets

Required secrets for full CI/CD functionality:

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `CODECOV_TOKEN` | Codecov upload token | Coverage reports |
| `PRIVATE_KEY` | Deployment wallet private key | Deployment |
| `SEPOLIA_RPC_URL` | Sepolia RPC endpoint | Deployment |
| `ETHERSCAN_API_KEY` | Etherscan API key | Verification |

#### How to Add Secrets

1. Go to repository **Settings**
2. Navigate to **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret with its value

#### Getting Secret Values

**CODECOV_TOKEN**:
1. Sign up at [Codecov.io](https://codecov.io/)
2. Link your GitHub repository
3. Copy the upload token

**PRIVATE_KEY**:
- Use a dedicated deployment wallet
- Never use your main wallet
- Export private key from MetaMask (without 0x prefix)

**SEPOLIA_RPC_URL**:
- Get from [Infura](https://infura.io/), [Alchemy](https://www.alchemy.com/), or use public endpoint
- Example: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**ETHERSCAN_API_KEY**:
1. Sign up at [Etherscan](https://etherscan.io/)
2. Go to **API Keys**
3. Create new API key

### 3. Add Status Badges

Add to your README.md:

```markdown
[![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with actual values.

## Workflow Details

### Test Matrix Strategy

Tests run in parallel across environments:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
    os: [ubuntu-latest, windows-latest]
```

**Total Test Jobs**: 4
- Ubuntu + Node 18.x
- Ubuntu + Node 20.x
- Windows + Node 18.x
- Windows + Node 20.x

### Dependency Caching

NPM dependencies are cached to speed up workflows:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
```

**Benefits**:
- Faster workflow execution
- Reduced NPM registry load
- Consistent dependency versions

### Fail-Fast Strategy

By default, if one job fails, others continue (no fail-fast). This ensures:
- All environments are tested
- Complete test coverage information
- Better debugging information

## Code Quality Checks

### 1. Prettier Formatting

**Check**:
```bash
npm run prettier:check
```

**Fix**:
```bash
npm run format
```

**Configuration**: `.prettierrc.json`

---

### 2. ESLint (JavaScript)

**Check**:
```bash
npm run lint:js
```

**Fix**:
```bash
npm run lint:js -- --fix
```

**Configuration**: `.eslintrc.json`

---

### 3. Solhint (Solidity)

**Check**:
```bash
npm run lint:sol
```

**Fix**:
```bash
npm run lint:sol -- --fix
```

**Configuration**: `.solhint.json`

**Ignore**: `.solhintignore`

---

### 4. Combined Linting

**Run all linters**:
```bash
npm run lint
```

**Fix all**:
```bash
npm run lint:fix
```

## Codecov Integration

### Coverage Reports

Coverage reports are automatically generated and uploaded to Codecov after tests complete.

### Configuration

**File**: `.codecov.yml`

**Settings**:
- **Target Coverage**: 70%
- **Threshold**: 5%
- **Precision**: 2 decimal places

**Ignore Patterns**:
- `test/**/*`
- `scripts/**/*`
- `node_modules/**/*`
- `artifacts/**/*`
- `cache/**/*`

### Viewing Coverage

1. Visit `https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO`
2. View coverage reports
3. Check line-by-line coverage
4. Monitor coverage trends

### Coverage Badge

Add to README:
```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

## Secrets Configuration

### Required Secrets

```bash
# Codecov
CODECOV_TOKEN=your_codecov_token_here

# Deployment
PRIVATE_KEY=your_private_key_without_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Security Best Practices

- ✅ Use dedicated deployment wallets
- ✅ Never commit secrets to repository
- ✅ Rotate keys regularly
- ✅ Use minimum required permissions
- ❌ Never share private keys
- ❌ Don't use production keys in CI/CD

## Local Testing

Before pushing, test workflows locally:

### 1. Test Compilation

```bash
npm run compile
```

### 2. Run Tests

```bash
npm test
```

### 3. Check Formatting

```bash
npm run prettier:check
```

### 4. Run Linters

```bash
npm run lint
```

### 5. Generate Coverage

```bash
npm run coverage
```

### Fix Issues

```bash
# Fix formatting
npm run format

# Fix linting
npm run lint:fix
```

## Troubleshooting

### Common Issues

#### 1. Test Failures

**Symptom**: Tests fail in CI but pass locally

**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Review OS-specific issues (Windows vs Ubuntu)
- Check environment variables

#### 2. Coverage Upload Fails

**Symptom**: Codecov upload fails

**Solutions**:
- Verify `CODECOV_TOKEN` is set correctly
- Check repository is linked to Codecov
- Ensure `coverage/lcov.info` is generated
- Review Codecov logs in Actions

#### 3. Linting Errors

**Symptom**: Linting fails in CI

**Solutions**:
```bash
# Run locally to see errors
npm run lint

# Fix automatically
npm run lint:fix

# Format code
npm run format
```

#### 4. Deployment Fails

**Symptom**: Deploy workflow fails

**Solutions**:
- Verify all secrets are set
- Check wallet has sufficient ETH
- Verify RPC URL is accessible
- Review deployment logs

#### 5. Compilation Errors

**Symptom**: Contracts don't compile

**Solutions**:
```bash
# Clean and recompile
npm run clean
npm run compile

# Check Solidity version
# Review contract dependencies
```

### Debug Workflows

Enable debug logging in GitHub Actions:

1. Go to repository **Settings**
2. **Secrets and variables** > **Actions**
3. Add secret: `ACTIONS_STEP_DEBUG` = `true`

### View Logs

1. Go to **Actions** tab
2. Click on failed workflow run
3. Click on failed job
4. Expand failed step
5. Review detailed logs

## Continuous Improvement

### Workflow Optimization

- **Cache Dependencies**: Already implemented
- **Parallel Jobs**: Tests run in parallel
- **Conditional Steps**: Some steps only run on specific conditions
- **Artifact Upload**: Deployment info preserved

### Future Enhancements

- [ ] Add end-to-end testing
- [ ] Implement automatic semantic versioning
- [ ] Add dependency update automation (Dependabot)
- [ ] Integrate additional security scanners
- [ ] Add performance benchmarking
- [ ] Implement canary deployments

## Best Practices

### Commit Messages

Follow conventional commits:
```
feat: add new selection criteria
fix: resolve registration bug
docs: update CI/CD documentation
test: add edge case tests
chore: update dependencies
```

### Pull Requests

1. Ensure all CI checks pass
2. Maintain or improve code coverage
3. Follow code style guidelines
4. Add tests for new features
5. Update documentation

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `bugfix/*`: Bug fix branches

## Monitoring

### GitHub Actions Status

Monitor workflow runs:
- **Actions** tab shows all runs
- Email notifications for failures
- Status badges in README

### Codecov Monitoring

- Coverage trends over time
- Line-by-line coverage
- Pull request coverage diff
- Coverage badges

## Resources

### Official Documentation

- [GitHub Actions](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Hardhat CI Guide](https://hardhat.org/hardhat-runner/docs/advanced/continuous-integration)

### Tools

- [Act](https://github.com/nektos/act) - Run GitHub Actions locally
- [GitHub CLI](https://cli.github.com/) - Interact with GitHub from terminal

---

## Summary

### CI/CD Pipeline Status

| Feature | Status | Configuration |
|---------|--------|---------------|
| Automated Testing | ✅ | `.github/workflows/test.yml` |
| Code Quality | ✅ | `.github/workflows/code-quality.yml` |
| Code Coverage | ✅ | `.codecov.yml` |
| Linting | ✅ | `.solhint.json`, `.eslintrc.json` |
| Formatting | ✅ | `.prettierrc.json` |
| Deployment | ✅ | `.github/workflows/deploy.yml` |
| Multi-OS | ✅ | Ubuntu, Windows |
| Multi-Node | ✅ | Node 18.x, 20.x |

### Commands Quick Reference

```bash
# Testing
npm test                 # Run tests
npm run coverage         # Generate coverage

# Linting
npm run lint            # Run all linters
npm run lint:sol        # Lint Solidity
npm run lint:js         # Lint JavaScript
npm run lint:fix        # Fix all issues

# Formatting
npm run format          # Format all files
npm run prettier:check  # Check formatting

# Compilation
npm run compile         # Compile contracts
npm run clean           # Clean artifacts

# Deployment
npm run deploy          # Deploy to Sepolia
npm run verify          # Verify on Etherscan
```

---

**Last Updated**: 2024-10-29
**CI/CD Status**: ✅ Fully Configured
**Coverage**: Codecov Integrated
**Quality Gates**: Multiple Checks Enabled
