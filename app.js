// Dependencies
const Manager = require('./lib/Manager');
const Engineer = require('./lib/Engineer');
const Intern = require('./lib/Intern');
const inquirer = require('inquirer');
const path = require('path');
const util = require('util');
const fs = require('fs');
const Logger = require('./logger');
const writeFileAsync = util.promisify(fs.writeFile);

const OUTPUT_DIR = path.resolve(__dirname, 'output');
const outputPath = path.join(OUTPUT_DIR, 'team.html');

const render = require('./lib/htmlRenderer');

const log = new Logger();

//* Blank array to be filled 
const teamMembersArray = [];

//* Introduction Question to open the appliccation
const cliIntroQuestion = {
	type: 'list',
	message: `
        
		Welcome to the Team Profile Generator Application. 

        This program will allow the user to create an HTML based team profile display that will outline the team members as well as some brief information on each team member. 
        
        The user will be prompted to submit information on the team manager as well as select how many team members other than the manager are in the team. 
        The user will then submit information for each team member, choosing if they are an engineer or intern and submit additional information based on the team member role selection. 

        Do you wish to continue with this application?`,
	choices: ['Yes, Start Building Team', 'No, Close Application'],
	name: 'cliIntroQ',
};

//* Questions 
const managerQuestions = [
	{
		type: 'input',
		message: "What is the Manager's name?",
		name: 'managerName',
	},
	{
		type: 'input',
		message: "What is the Manager's ID number?",
		name: 'managerId',
		validate: function (num) {
			numbers = /^[0-9]+$/.test(num);

			if (numbers) {
				log.green(`        ----------Number Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid ID Number that does not include anything other than numbers (No letters or symbols)----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is the Manager's email?",
		name: 'manageEmail',
		validate: function (emailInput) {
			emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput);

			if (emailFormat) {
				log.green(`        ----------Email Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid email----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is the Manager's office number?",
		name: 'managerOfficeNumber',
	},
];

//* questions 
const endManagerQuestions = {
	type: 'list',
	message: 'Would you like to add another team member to this team? Select Yes to add an Engineer or Intern team member or select No if no additional team members need to be added.',
	choices: ['Yes', 'No'],
	name: 'teamSize',
};

//* Question 
const teamMemberRolePick = {
	type: 'list',
	message: 'Is this team member an Engineer or an Intern?',
	choices: ['Engineer', 'Intern'],
	name: 'teamMemberRoleType',
};

//* Questions 
const engineerQuestions = [
	{ 
		
		type: 'input',
		message: "What is this Engineer's name?",
		name: 'enginnerName',
	},
	{
		
		type: 'input',
		message: "What is this Engineer's ID number?",
		name: 'engineerId',
		validate: function (num) {
			numbers = /^[0-9]+$/.test(num);

			if (numbers) {
				log.green(`        ----------Number Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid ID Number that does not include anything other than numbers (No letters or symbols)----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is this Engineer's email?",
		name: 'engineerEmail',
		validate: function (emailInput) {
			emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput);

			if (emailFormat) {
				log.green(`        ----------Email Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid email----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is this Engineer's GitHub Profile Name?",
		name: 'engineerGithub',
	},
];

//* Questions 
const internQuestions = [
	{
		type: 'input',
		message: "What is this Intern's name?",
		name: 'internName',
	},
	{
		type: 'input',
		message: "What is this Intern's ID number?",
		name: 'internId',
		validate: function (num) {
			numbers = /^[0-9]+$/.test(num);

			if (numbers) {
				log.green(`        ----------Number Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid ID Number that does not include anything other than numbers (No letters or symbols)----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is this Intern's email?",
		name: 'internEmail',
		validate: function (emailInput) {
			emailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailInput);

			if (emailFormat) {
				log.green(`        ----------Email Formatting Accepted----------`);
				return true;
			} else {
				log.red(`        ----------Please enter a valid email----------`);
				return false;
			}
		},
	},
	{
		type: 'input',
		message: "What is this Intern's School/University?",
		name: 'internSchool',
	},
];

//* Initial function that asks if the user wants to build the team and the introduction message
function cliIntro() {
	inquirer.prompt(cliIntroQuestion).then((appStart) => {
		if (appStart.cliIntroQ === 'Yes, Start Building Team') {
			log.green('Please Submit Manager Profile Information');
			managerInfo();
		} else {
			log.yellow(`
        ------------------------------------------------------------
        ---------------------Application Closed---------------------
        ------------------------------------------------------------
            `);
		}
	});
}

//* Function to build the team manager and then call the function
function managerInfo() {
	inquirer.prompt(managerQuestions).then((managerBuild) => {
		let manager = new Manager(managerBuild.managerName, managerBuild.managerId, managerBuild.manageEmail, managerBuild.managerOfficeNumber);
		teamMembersArray.push(manager);


		teamSizeInfo();
	});
}

//* Function to determine the size of the team 
function teamSizeInfo() {
	inquirer.prompt(endManagerQuestions).then((teamSize) => {
		if (teamSize.teamSize === 'Yes') {
			teamMemberLoop();
		}
		if (teamSize.teamSize === 'No') {
			renderHTML(teamMembersArray);
		}
	});
}

//* Function to choose the type of team member (engineer or intern)
function teamMemberLoop() {
	inquirer.prompt(teamMemberRolePick).then((teamrole) => {
		if (teamrole.teamMemberRoleType === 'Engineer') {
			log.blue('Please Submit Engineer Profile Information');
			inquirer.prompt(engineerQuestions).then((engineerBuild) => {
				let engineer = new Engineer(engineerBuild.enginnerName, engineerBuild.engineerId, engineerBuild.engineerEmail, engineerBuild.engineerGithub);
				teamMembersArray.push(engineer);
				teamSizeInfo();
			});
		} else if (teamrole.teamMemberRoleType === 'Intern') {
			log.magenta('Please Submit Intern Profile Information');
			inquirer.prompt(internQuestions).then((internBuild) => {
				let intern = new Intern(internBuild.internName, internBuild.internId, internBuild.internEmail, internBuild.internSchool);
				teamMembersArray.push(intern);
				teamSizeInfo();
			});
		}
	});
}

//* Function to write array information to HTML templates when no more team members are added to the application. 

async function renderHTML(file) {
	const htmlProfilePage = render(file);

	await writeFileAsync(outputPath, htmlProfilePage).then(function () {
		log.green(`
        ----------------------------------------------------------------
        ---------------------Team Profile Completed---------------------
        ----------------------------------------------------------------
        `);
	});
}

cliIntro();
