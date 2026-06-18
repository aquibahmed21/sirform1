// Helper to build row strings inside the Print Window Document
function createRow(label, value)
{
  return `
        <tr>
            <td class="label">${label}</td>
            <td>${value ? value.toUpperCase().trim() : ""}</td>
        </tr>
    `;
}

// Initializing application bindings
document.addEventListener("DOMContentLoaded", function ()
{

  renderHistory();

  // Dynamically convert typed inputs into true uppercase string values
  document.querySelectorAll('.uppercase-input').forEach(function (input)
  {
    input.addEventListener('input', function ()
    {
      this.value = this.value.toUpperCase();
    });
  });

  // Handle search input events
  document.getElementById('historySearch').addEventListener('input', function ()
  {
    renderHistory(this.value.toUpperCase());
  });
});

document.getElementById("verificationForm").querySelectorAll('input').forEach(input => input.addEventListener('dblclick', function (event)
{
  const value = event.target.value;
  // copy to clipboard
  if (value)
    navigator.clipboard.writeText(value);
}));

// Intercept form submissions
document.getElementById("verificationForm").addEventListener("submit", function (event)
{
  event.preventDefault();
  const isEdit = document.querySelector('[type="submit"]').getAttribute('data-id');
  // Data parsing with direct normalization into Caps
  const record = {
    id: isEdit || 'REC_' + Date.now(),
    timestamp: new Date().toLocaleString().toUpperCase(),

    oldName: document.getElementById('oldName').value.toUpperCase(),
    oldEpic: document.getElementById('oldEpic').value.toUpperCase(),
    oldRelative: document.getElementById('oldRelative').value.toUpperCase(),
    oldRelationship: document.getElementById('oldRelationship').value.toUpperCase(),
    oldDob: document.getElementById('oldDob').value.toUpperCase(),
    oldDistrict: document.getElementById('oldDistrict').value.toUpperCase(),
    oldAcNo: document.getElementById('oldAcNo').value.toUpperCase(),
    oldAcName: document.getElementById('oldAcName').value.toUpperCase(),
    oldPartNo: document.getElementById('oldPartNo').value.toUpperCase(),
    oldSlNo: document.getElementById('oldSlNo').value.toUpperCase(),

    personType: document.querySelector('input[name="personType"]:checked').value.toUpperCase(),

    newName: document.getElementById('newName').value.toUpperCase(),
    newEpic: document.getElementById('newEpic').value.toUpperCase(),
    newRelative: document.getElementById('newRelative').value.toUpperCase(),
    newRelationship: document.getElementById('newRelationship').value.toUpperCase(),
    newDob: document.getElementById('newDob').value.toUpperCase(),
    newDistrict: document.getElementById('newDistrict').value.toUpperCase(),
    newAcNo: document.getElementById('newAcNo').value.toUpperCase(),
    newAcName: document.getElementById('newAcName').value.toUpperCase(),
    newPartNo: document.getElementById('newPartNo').value.toUpperCase(),
    newSlNo: document.getElementById('newSlNo').value.toUpperCase(),
    contact: document.getElementById('contact').value.toUpperCase(),

    // Enumeration Details

    enumAadhaarNo: document.getElementById('enumAadhaarNo').value.toUpperCase(),
    enumNumberNo: document.getElementById('enumNumberNo').value.toUpperCase(),
    enumGuardianName: document.getElementById('enumGuardianName').value.toUpperCase(),
    enumGuardianEpic: document.getElementById('enumGuardianEpic').value.toUpperCase(),
    enumMotherName: document.getElementById('enumMotherName').value.toUpperCase(),
    enumMotherEpic: document.getElementById('enumMotherEpic').value.toUpperCase(),
    enumSpouseName: document.getElementById('enumSpouseName').value.toUpperCase(),
    enumSpouseEpic: document.getElementById('enumSpouseEpic').value.toUpperCase(),

    is2002NamePresent: document.querySelector('input[name="is2002NamePresent"]:checked').value.toUpperCase(),

    enumElectoralName: document.getElementById('enumElectoralName').value.toUpperCase(),
    enumElectoralEpicNo: document.getElementById('enumElectoralEpicNo').value.toUpperCase(),
    enumElectoralRelativeName: document.getElementById('enumElectoralRelativeName').value.toUpperCase(),
    enumElectoralRelationship: document.getElementById('enumElectoralRelationship').value.toUpperCase(),
    enumElectoralDistrict: document.getElementById('enumElectoralDistrict').value.toUpperCase(),
    enumElectoralState: document.getElementById('enumElectoralState').value.toUpperCase(),
    enumElectoralConstituency: document.getElementById('enumElectoralConstituency').value.toUpperCase(),
    enumElectoralAcNo: document.getElementById('enumElectoralAcNo').value.toUpperCase(),
    enumElectoralPartNo: document.getElementById('enumElectoralPartNo').value.toUpperCase(),
    enumElectoralSlNo: document.getElementById('enumElectoralSlNo').value.toUpperCase(),

    enumElectoralP4Name: document.getElementById('enumElectoralP4Name').value.toUpperCase(),
    enumElectoralEpicP4No: document.getElementById('enumElectoralEpicP4No').value.toUpperCase(),
    enumElectoralP4RelativeName: document.getElementById('enumElectoralP4RelativeName').value.toUpperCase(),
    enumElectoralRelationshipP4: document.getElementById('enumElectoralRelationshipP4').value.toUpperCase(),
    enumElectoralDistrictP4: document.getElementById('enumElectoralDistrictP4').value.toUpperCase(),
    enumElectoralStateP4: document.getElementById('enumElectoralStateP4').value.toUpperCase(),
    enumElectoralConstituencyP4: document.getElementById('enumElectoralConstituencyP4').value.toUpperCase(),
    enumElectoralAcNoP4: document.getElementById('enumElectoralAcNoP4').value.toUpperCase(),
    enumElectoralPartNoP4: document.getElementById('enumElectoralPartNoP4').value.toUpperCase(),
    enumElectoralSlNoP4: document.getElementById('enumElectoralSlNoP4').value.toUpperCase(),
  };

  saveRecord(record, isEdit);
  this.reset();
  renderHistory();
});

// reset button
document.getElementById("resetForm").addEventListener("click", function (event)
{
  event.preventDefault();
  document.getElementById("verificationForm").reset();
  document.querySelector('[type="submit"]').removeAttribute('data-id');
});

// Storage engine abstractions
function saveRecord(record, isEdit)
{
  let history = JSON.parse(localStorage.getItem('voterHistory')) || [];
  if (isEdit)
  {
    history = history.filter(item => item.id !== isEdit);
    document.getElementById(isEdit).remove();
  }
  history.unshift(record); // Push latest to top
  localStorage.setItem('voterHistory', JSON.stringify(history));
  document.querySelector('[type="submit"]').removeAttribute('data-id');
}

function deleteRecord(id)
{
  if (confirm("ARE YOU SURE YOU WANT TO DELETE THIS HISTORICAL LOG ENTRY?"))
  {
    let history = JSON.parse(localStorage.getItem('voterHistory')) || [];
    history = history.filter(item => item.id !== id);
    localStorage.setItem('voterHistory', JSON.stringify(history));
    renderHistory(document.getElementById('historySearch').value.toUpperCase());
  }
}

// Render dynamic elements & execute filtration by Name/EPIC
function renderHistory(filterText = '')
{
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '';

  const history = JSON.parse(localStorage.getItem('voterHistory')) || [];

  const filtered = history.filter(item =>
  {
    if (!filterText) return true;
    return item.oldName.includes(filterText) ||
      item.oldEpic.includes(filterText) ||
      item.newName.includes(filterText) ||
      item.newEpic.includes(filterText);
  });

  if (filtered.length === 0)
  {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">NO RECORD ENTRIES FOUND MATCHING CRITERIA</td></tr>`;
    return;
  }

  filtered.forEach(item =>
  {
    const tr = document.createElement('tr');
    tr.setAttribute('id', item.id);
    tr.innerHTML = `
            <td>${item.timestamp}</td>
            <td><strong>${item.oldName}</strong><br><small>${item.oldEpic}</small></td>
            <td><strong>${item.newName || 'N/A'}</strong><br><small>${item.newEpic || 'N/A'}</small></td>
            <td>${item.personType}</td>
            <td>
                <button class="actionBtn print" >PRINT</button>
                <button class="actionBtn print printEnumeration" >PRINT ENUMERATION</button>
                <button class="actionBtn edit" >EDIT</button>
                <button class="actionBtn delete" >DELETE</button>
                <button class="actionBtn view" >PROGENY</button>
            </td>
        `;
    tbody.appendChild(tr);
    tr.querySelector('.print').onclick = () => printFromHistory(item);
    tr.querySelector('.edit').onclick = () => editRecord(item.id);
    tr.querySelector('.delete').onclick = () => deleteRecord(item.id);
    tr.querySelector('.view').onclick = () => addProgeny(item.id);
    tr.querySelector('.printEnumeration').onclick = () => printEnumeration(item.id);
    tr.scrollIntoView();
  });
}

function addProgeny(id)
{
  const record = JSON.parse(localStorage.getItem('voterHistory')).find(item => item.id === id);
  if (!record) return;
  const confirm = window.confirm("Are you sure you want to add progeny of " + record.newName + "?");
  if (!confirm) return;
  document.getElementById('oldName').value = record.newName;
  document.getElementById('oldEpic').value = record.newEpic;
  document.getElementById('oldRelative').value = record.newRelative;
  document.getElementById('oldRelationship').value = record.newRelationship;
  document.getElementById('oldDob').value = record.newDob;
  document.getElementById('oldDistrict').value = record.newDistrict;
  document.getElementById('oldAcNo').value = record.newAcNo;
  document.getElementById('oldAcName').value = record.newAcName;
  document.getElementById('oldPartNo').value = record.newPartNo;
  document.getElementById('oldSlNo').value = record.newSlNo;
  document.getElementById('newRelative').value = record.newName;
  document.getElementById('newName').previousElementSibling.scrollIntoView();
  document.getElementById('newName').focus();
}

function printEnumeration(id)
{
  const record = JSON.parse(localStorage.getItem('voterHistory')).find(item => item.id === id);
  if (!record) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow)
  {
    alert("POP-UP BLOCKED! PLEASE ALLOW POP-UPS TO PRINT DOCUMENT COMPILATIONS.");
    return;
  }

  printWindow.afterprint = () => printWindow.close();

  printWindow.document.write(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          * {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: Arial, Helvetica, sans-serif;
	background: #f4f4f4;
	padding: 20px;
}

.app {
	background: #fff;
	padding: 20px;
	max-width: 1400px;
	margin: auto;
	border-radius: 8px;
}

h1,
h2 {
	margin-bottom: 15px;
	margin-top: 15px;
}

.grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
	gap: 12px;
	margin-bottom: 20px;
}

input {
	width: 100%;
	padding: 10px;
	border: 1px solid #ccc;
}

.actions {
	display: flex;
	gap: 10px;
	margin: 20px 0;
}

button {
	padding: 10px 20px;
	cursor: pointer;
}

table {
	width: 100%;
	border-collapse: collapse;
}

table th,
table td {
	border: 1px solid #000;
	padding: 6px;
	vertical-align: top;
}

#tbl {
	margin-top: 15px;
}

#tbl th {
	background: #efefef;
}

#tbl button {
	margin-right: 5px;
}

/* ===========================
PRINT
=========================== */

#printArea {
	display: none;
}

.page {
	width: 210mm;
	min-height: 297mm;
	padding: 8mm;
	background: #fff;
	color: #000;
}

.title {
	text-align: center;
	margin-bottom: 10px;
}

.top-box {
	margin-bottom: 10px;
}

.top-box td {
	height: 60px;
	text-align: center;
	font-size: 12px;
}

.info {
	margin-bottom: 10px;
}

.info td:first-child {
	width: 35%;
	font-weight: bold;
}

.sir {
	margin-top: 10px;
	margin-bottom: 10px;
}

.sir th {
	text-align: center;
	background: #f5f5f5;
}

.declaration {
	margin-top: 10px;
	font-size: 12px;
	line-height: 1.5;
}

.signature {
	margin-top: 25px;
	text-align: right;
}

.signature div {
	min-height: 30px;
	margin-bottom: 5px;
}

@page {
	size: A4;
	margin: 0;
}

@media print {

	body {
		background: #fff;
		padding: 0;
		margin: 0;
	}

	.no-print {
		display: none !important;
	}

	#printArea {
		display: block !important;
	}

	.page {
		width: 210mm;
		min-height: 297mm;
		page-break-after: always;
	}

}
      </style>
  </head>
  <body>
    	<div id="printArea">

		<div class="page">

			<div class="title">
				<h2>Enumeration Form</h2>
				<h4>Name and contact No of BLO (pre-printed)</h4>
			</div>

			<table class="top-box">
				<tr>
					<td>Elector's Name, EPIC, Address (Pre-printed)</td>
					<td>Serial No, Part No & Name, AC/PC Name, State</td>
					<td>QR Code</td>
					<td>Old Photo</td>
					<td>Paste Current Photo</td>
				</tr>
			</table>

			<table class="info">
				<tr>
					<td>Date Of Birth</td>
					<td id="pDob">${record.oldDob}</td>
				</tr>
				<tr>
					<td>Aadhaar No</td>
					<td id="pAadhaar">${record.enumAadhaarNo}</td>
				</tr>
				<tr>
					<td>Mobile No</td>
					<td id="pMobile">${record.contact}</td>
				</tr>
				<tr>
					<td>Father's/Guardian Name</td>
					<td id="pFatherName">${record.enumGuardianName}</td>
				</tr>
				<tr>
					<td>Father's EPIC</td>
					<td id="pFatherEpic">${record.enumGuardianEpic}</td>
				</tr>
				<tr>
					<td>Mother Name</td>
					<td id="pMotherName">${record.enumMotherName}</td>
				</tr>
				<tr>
					<td>Mother EPIC</td>
					<td id="pMotherEpic">${record.enumMotherEpic}</td>
				</tr>
				<tr>
					<td>Spouse Name</td>
					<td id="pSpouseName">${record.enumSpouseName}</td>
				</tr>
				<tr>
					<td>Spouse EPIC</td>
					<td id="pSpouseEpic">${record.enumSpouseEpic}</td>
				</tr>
			</table>

			<table class="sir">
				<tr>
					<th colspan="2">
						Details of Elector in Electoral Roll of last SIR
					</th>
					<th colspan="2">
						Details of Relative in last SIR
					</th>
				</tr>

				<tr>
					<td>Elector Name</td>
					<td id="pElectorName">${record.enumElectoralName}</td>
					<td>Name</td>
					<td id="pRelativeName">${record.enumElectoralP4Name}</td>
				</tr>

				<tr>
					<td>EPIC</td>
					<td id="pElectorEpic">${record.enumElectoralEpicNo}</td>
					<td>EPIC</td>
					<td id="pRelativeEpic">${record.enumElectoralEpicP4No}</td>
				</tr>

				<tr>
					<td>Relative Name</td>
					<td id="pElectorRelativeName">${record.enumElectoralRelativeName}</td>
					<td>Relative Name</td>
					<td id="pRelativeRelativeName">${record.enumElectoralP4RelativeName}</td>
				</tr>

				<tr>
					<td>Relationship</td>
					<td id="pElectorRelationship">${record.enumElectoralRelationship}</td>
					<td>Relationship</td>
					<td id="pRelativeRelationship">${record.enumElectoralRelationshipP4}</td>
				</tr>

				<tr>
					<td>District</td>
					<td id="pElectorDistrict">${record.enumElectoralDistrict}</td>
					<td>District</td>
					<td id="pRelativeDistrict">${record.enumElectoralDistrictP4}</td>
				</tr>

				<tr>
					<td>State</td>
					<td id="pElectorState">${record.enumElectoralState}</td>
					<td>State</td>
					<td id="pRelativeState">${record.enumElectoralStateP4}</td>
				</tr>

				<tr>
					<td>AC Name</td>
					<td id="pElectorAcName">${record.enumElectoralConstituency}</td>
					<td>AC Name</td>
					<td id="pRelativeAcName">${record.enumElectoralConstituencyP4}</td>
				</tr>

			</table>

			<div class="declaration">
				<p>(i) The elector mentioned above has not acquired citizenship of any other country.</p>
				<p>(ii) I am applying for inclusion in Electoral Roll.</p>
				<p>(iii) False declaration is punishable under Section 31 of Representation of People Act.</p>
			</div>

			<div class="signature">
				<div id="pSignature"></div>
				<strong>Signature / Left Thumb Impression</strong>
			</div>

		</div>

	</div>

  </body>
  </html>`);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  setTimeout(() => printWindow.close(), 300);
  // printWindow.close();
}

// Router adapter to link edit buttons directly to the template generator
function editRecord(id)
{
  const record = JSON.parse(localStorage.getItem('voterHistory')).find(item => item.id === id);
  if (!record) return;

  document.getElementById('oldName').value = record.oldName;
  document.getElementById('oldEpic').value = record.oldEpic;
  document.getElementById('oldRelative').value = record.oldRelative;
  document.getElementById('oldRelationship').value = record.oldRelationship;
  document.getElementById('oldDob').value = record.oldDob;
  document.getElementById('oldDistrict').value = record.oldDistrict;
  document.getElementById('oldAcNo').value = record.oldAcNo;
  document.getElementById('oldAcName').value = record.oldAcName;
  document.getElementById('oldPartNo').value = record.oldPartNo;
  document.getElementById('oldSlNo').value = record.oldSlNo;
  document.getElementById('newName').value = record.newName;
  document.getElementById('newEpic').value = record.newEpic;
  document.getElementById('newRelative').value = record.newRelative;
  document.getElementById('newRelationship').value = record.newRelationship;
  document.getElementById('newDob').value = record.newDob;
  document.getElementById('newDistrict').value = record.newDistrict;
  document.getElementById('newAcNo').value = record.newAcNo;
  document.getElementById('newAcName').value = record.newAcName;
  document.getElementById('newPartNo').value = record.newPartNo;
  document.getElementById('newSlNo').value = record.newSlNo;
  document.getElementById('contact').value = record.contact;
  document.querySelector('input[name="personType"][valueType="' + record.personType + '"]').checked = true;
  document.querySelector('[type="submit"]').setAttribute('data-id', id);
  document.getElementById('oldName').previousElementSibling.scrollIntoView();
  document.getElementById('oldName').focus();

  // Enumeration Details
  document.getElementById('enumAadhaarNo').value = record.enumAadhaarNo || "";
  document.getElementById('enumNumberNo').value = record.enumNumberNo || "";
  document.getElementById('enumGuardianName').value = record.enumGuardianName || "";
  document.getElementById('enumGuardianEpic').value = record.enumGuardianEpic || "";
  document.getElementById('enumMotherName').value = record.enumMotherName || "";
  document.getElementById('enumMotherEpic').value = record.enumMotherEpic || "";
  document.getElementById('enumSpouseName').value = record.enumSpouseName || "";
  document.getElementById('enumSpouseEpic').value = record.enumSpouseEpic || "";

  document.querySelector('input[name="is2002NamePresent"][valueType="' + record.is2002NamePresent + '"]').checked = true || "";

  document.getElementById('enumElectoralName').value = record.enumElectoralName || "";
  document.getElementById('enumElectoralEpicNo').value = record.enumElectoralEpicNo || "";
  document.getElementById('enumElectoralRelativeName').value = record.enumElectoralRelativeName || "";
  document.getElementById('enumElectoralRelationship').value = record.enumElectoralRelationship || "";
  document.getElementById('enumElectoralDistrict').value = record.enumElectoralDistrict || "";
  document.getElementById('enumElectoralState').value = record.enumElectoralState || "";
  document.getElementById('enumElectoralAcNo').value = record.enumElectoralAcNo || "";
  document.getElementById('enumElectoralPartNo').value = record.enumElectoralPartNo || "";
  document.getElementById('enumElectoralSlNo').value = record.enumElectoralSlNo || "";
  document.getElementById('enumElectoralConstituency').value = record.enumElectoralConstituency || "";

  document.getElementById('enumElectoralP4Name').value = record.enumElectoralP4Name || "";
  document.getElementById('enumElectoralEpicP4No').value = record.enumElectoralEpicP4No || "";
  document.getElementById('enumElectoralP4RelativeName').value = record.enumElectoralP4RelativeName || "";
  document.getElementById('enumElectoralRelationshipP4').value = record.enumElectoralRelationshipP4 || "";
  document.getElementById('enumElectoralDistrictP4').value = record.enumElectoralDistrictP4 || "";
  document.getElementById('enumElectoralStateP4').value = record.enumElectoralStateP4 || "";
  document.getElementById('enumElectoralAcNoP4').value = record.enumElectoralAcNoP4 || "";
  document.getElementById('enumElectoralPartNoP4').value = record.enumElectoralPartNoP4 || "";
  document.getElementById('enumElectoralSlNoP4').value = record.enumElectoralSlNoP4 || "";
  document.getElementById('enumElectoralConstituencyP4').value = record.enumElectoralConstituencyP4 || "";
}

// Router adapter to link history buttons directly to the template generator
function printFromHistory(record)
{
  generatePrintPage(record);
}

// Document layout compilation for target windows
function generatePrintPage(data)
{
  const printWindow = window.open("", "_blank");
  if (!printWindow)
  {
    alert("POP-UP BLOCKED! PLEASE ALLOW POP-UPS TO PRINT DOCUMENT COMPILATIONS.");
    return;
  }

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>PRINT VOTER VERIFICATION LOG</title>
<style>
    body { font-family: Arial, sans-serif; margin: 10px; background: #fff; text-transform: uppercase; }
    .wrapper { display: flex; gap: 15px; width: 100%; }
    .tableContainer { flex: 1; width: 50%; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td, th { border: 1px solid #000; padding: 6px; font-size: 11px; word-wrap: break-word; }
    th { text-align: center; background-color: #f2f2f2; }
    .label { width: 35%; font-weight: bold; }
    .blo { margin-top: 15px; border: 1px solid #000; padding: 10px; font-size: 12px; font-weight: bold; min-height: 50px; }
    @media print {
        body { margin: 0; }
        .wrapper { display: flex; flex-direction: row !important; }
    }
</style>
</head>
<body>

<div class="wrapper">
    <div class="tableContainer">
        <table>
            <tr><th colspan="2">FILL 2002 DETAILS FROM OLD VOTER LIST</th></tr>
            ${createRow("NAME", data.oldName)}
            ${createRow("EPIC NO", data.oldEpic)}
            ${createRow("RELATIVE'S NAME", data.oldRelative)}
            ${createRow("RELATIONSHIP", data.oldRelationship)}
            ${createRow("AGE / DOB", data.oldDob)}
            ${createRow("DISTRICT", data.oldDistrict)}
            ${createRow("AC NO", data.oldAcNo)}
            ${createRow("AC NAME", data.oldAcName)}
            ${createRow("PART NO", data.oldPartNo)}
            ${createRow("SL NO", data.oldSlNo)}
            <tr><td class="label">&nbsp;</td><td>&nbsp;</td></tr>
        </table>
        <div class="blo">BLO REMARKS / SIGNATURE:</div>
    </div>

    <div class="tableContainer">
        <table>
            <tr><th colspan="2">FILL 2026 DETAILS FOR CURRENT VERIFICATION</th></tr>
            <tr>
                <td colspan="2" style="font-size: 10px; font-weight: bold; padding: 7px 4px;">
                    VERIFICATION STATUS ⇒
                    ${data.personType === "SAME PERSON (SELF)" ? "☑" : "☐"} SELF
                    &nbsp;&nbsp;
                    ${data.personType === "SON / DAUGHTER (PROGENY)" ? "☑" : "☐"} PROGENY
                </td>
            </tr>
            ${createRow("NAME", data.newName)}
            ${createRow("EPIC NO", data.newEpic)}
            ${createRow("RELATIVE'S NAME", data.newRelative)}
            ${createRow("RELATIONSHIP", data.newRelationship)}
            ${createRow("AGE / DOB", data.newDob)}
            ${createRow("DISTRICT", data.newDistrict)}
            ${createRow("AC NO", data.newAcNo)}
            ${createRow("AC NAME", data.newAcName)}
            ${createRow("PART NO", data.newPartNo)}
            ${createRow("SL NO", data.newSlNo)}
            ${createRow("CONTACT", data.contact)}
        </table>
    </div>
</div>

<script>
    window.onload = function() {
        setTimeout(function() {
            window.print();
        }, 300);
    };

    window.onafterprint = () => {
        window.close();
    };
<\/script>
</body>
</html>
    `);

  printWindow.document.close();
}
