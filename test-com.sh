#!/bin/sh

npx playwright test --update-snapshots

allure generate ./allure-results -o ./allure-report --clean

npx playwright test

allure generate ./allure-results -o ./allure-report --clean