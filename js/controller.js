app.controller("myController", function($scope, $window) {
    // Constants
    const costPerEmployee = 1000;                       // cost of benefits per year for employee
    const costPerDependent = 500;                       // cost of benefits per year for dependent
    const discountPercent = .1;                         // discount percentage
    const discountNameFirstLetter = "A";           // anyone whose name starts with this letter gets discount
    const amountPerPaycheck = 2000;                     // employee pre-deduction paycheck amount
    const numOfPaychecksPerYear = 26;                   // number of paychecks per year
    const maxNameChars = 15;                            // maximum number of characters per name
    const dropDownDefaultText = 'Select employee...';   // default text of the "add spouse/dependent" dropdown button

    // Scope globals
    $scope.employees = [];                      // list of employees added to benefits cost preview table
    $scope.empIndexSelected = 0;                // index of the user-selected employee
    $scope.disableEmployeeAddBtn = false;
    $scope.disableDependentAddDropDown = true;
    $scope.disableDependentAddFields = true;
    $scope.disableDependentAddBtn = true;
    $scope.disableResetBtn = true;
    $scope.dropDownText = dropDownDefaultText;  // pre-selected dropdown menu button text
    $scope.dropDownNameSelected = '';           // selected employee from dropdown menu
    $scope.validName = false;
    $scope.empFirstName = '';
    $scope.empLastName = '';
    $scope.depFirstName = '';
    $scope.depLastName = '';
    $scope.employee = '';
    $scope.cost = 0;
    $scope.totalCostPerYear = 0;
    $scope.yearlyRemaining = numOfPaychecksPerYear * amountPerPaycheck;

    // Add Employee to the table
    $scope.addEmployee = function () {
        $scope.validateNames($scope.empFirstName, $scope.empLastName);

        if ($scope.validName) {
            $scope.basePrice = costPerEmployee;
            $scope.getCost($scope.empFirstName);

            let employee = {
                id: $scope.employees.length + 1,
                employee_name: $scope.empFirstName + " " + $scope.empLastName,
                dependents: [],
                totalBenefitsCostPerYear: $scope.cost.toFixed(2),
                benefitsCostPerPaycheck: ($scope.cost / numOfPaychecksPerYear).toFixed(2),
                yearlySalaryRemaining: ((numOfPaychecksPerYear * amountPerPaycheck) - $scope.cost).toFixed(2)
            };

            $scope.employees.push(employee);
            $scope.disableDependentAddDropDown = false;
            $scope.disableResetBtn = false;
            $scope.validName = false;
        }

        $scope.resetScope();
    }

    // Add Spouse/Dependent
    $scope.addDependent = function () {
        var employeeSelected = $scope.employees[$scope.empIndexSelected];
        $scope.validateNames($scope.depFirstName, $scope.depLastName);

        if ($scope.validName) {
            $scope.basePrice = costPerDependent;
            $scope.getCost($scope.depFirstName);

            let dependent = {
                id: $scope.employees.length + 1,
                dependent_name: $scope.depFirstName + " " + $scope.depLastName,
                cost: $scope.cost.toFixed(2)
            };

            employeeSelected.dependents.push(dependent);

            employeeSelected.totalBenefitsCostPerYear = (eval(employeeSelected.totalBenefitsCostPerYear) + eval(dependent.cost)).toFixed(2);
            employeeSelected.benefitsCostPerPaycheck = (eval(employeeSelected.totalBenefitsCostPerYear) / numOfPaychecksPerYear).toFixed(2);
            employeeSelected.yearlySalaryRemaining = ((numOfPaychecksPerYear * amountPerPaycheck) - eval(employeeSelected.totalBenefitsCostPerYear)).toFixed(2);

            $scope.validName = false;
        }

        $scope.resetScope();
    }

    // Print out the dependents for a given employee for display in the table
    $scope.printDependents = function(index) {
        var dependents = $scope.employees[index].dependents;
        var names = '';

        if (dependents.length > 0) {
            for (var i = 0; i < dependents.length; i++) {
                names += dependents[i].dependent_name + '<br>';
            }
        }

        return names;
    }

    // First and last name validation
    $scope.validateNames = function(firstName, lastName) {
        var letters = /^[A-Za-z]+$/;    // regex for alphabetic characters only

        // Check for nulls (no name in either or both fields)
        if (!firstName && !lastName) {
            alert('First and last name required!');
            return;
        } else if (!firstName) {
            alert('First name required!');
            return;
        } else if (!lastName) {
            alert('Last name required!');
            return;
        }

        // Check for valid characters
        if (!firstName.match(letters) && !lastName.match(letters)) {
            alert('First and last name should not include special characters or spaces!');
            return;
        } else if (!firstName.match(letters)) {
            alert('First name should not include special characters or spaces!');
            return;
        } else if (!lastName.match(letters)) {
            alert('Last name should not include special characters or spaces!');
            return;
        }

        // Check that names are not too long
        if (firstName.length > maxNameChars && lastName.length > maxNameChars) {
            alert('First and last name should not exceed ' + maxNameChars + ' characters each!');
            return;
        } else if (firstName.length > maxNameChars ) {
            alert('First name should not exceed ' + maxNameChars + ' characters!');
            return;
        } else if (lastName.length > maxNameChars) {
            alert('Last name should not exceed ' + maxNameChars + ' characters!');
            return;
        } else {
            // Passed all the checks
            $scope.validName = true;
        }

        return;
    }

    // Reset the scope in this context
    $scope.resetScope = function() {
        $scope.empFirstName = '';
        $scope.empLastName = '';
        $scope.depFirstName = '';
        $scope.depLastName = '';
        $scope.employee = '';
        $scope.cost = 0;
        $scope.validName = false;
        $scope.dropDownText = dropDownDefaultText;
        $scope.disableDependentAddFields = true;
        $scope.disableDependentAddBtn = true;
    }

    // Get cost of employee or dependent
    $scope.getCost = function (firstName) {
        let name = firstName.toUpperCase();

        if (name.startsWith(discountNameFirstLetter)) {
            $scope.cost = $scope.basePrice - ($scope.basePrice * discountPercent);
        } else {
            $scope.cost = $scope.basePrice;
        }
    }

    $scope.selectName = function (index, nameSelected) {
        $scope.dropDownNameSelected = nameSelected;
        $scope.dropDownText = nameSelected;
        $scope.disableDependentAddFields = false;
        $scope.disableDependentAddBtn = false;
        $scope.empIndexSelected = index;
    }

    // Remove employee (and accompanying dependents) record
    $scope.deleteRecord = function (index) {
        let name = $scope.employees[index].employee_name;
        let depIsPlural = false;
        let depPluralPhrase = '(and their dependent(s)) ';

        if ($scope.employees[index].dependents.length > 0) {
            depIsPlural = true;
        }

        // Find the record using the given user-selected employee record
        if ($window.confirm('Are you sure you want to delete ' + name + '\'s ' + (depIsPlural ? depPluralPhrase : '') + 'record?')) {
            // Remove the record from the list/table
            $scope.employees.splice(index, 1);

            // Reset fields for "add dependent" form
            if ($scope.employees.length == 0 || $scope.employees === []) {
                $scope.disableDependentAddDropDown = true;
                $scope.dropDownText = dropDownDefaultText;
                $scope.disableDependentAddBtn = true;
                $scope.disableResetBtn = true;
            }
        }
    }

    // Reset the benefits cost preview table
    $scope.resetTable = function() {
        if ($window.confirm('Are you sure you want to reset the table?')) {
            $scope.employees = [];
            $scope.disableDependentAddDropDown = true;
            $scope.dropDownText = dropDownDefaultText;
            $scope.disableDependentAddFields = true;
            $scope.disableDependentAddBtn = true;
            $scope.disableResetBtn = true;
        }
    }
});