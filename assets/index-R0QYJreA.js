//#region \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
//#endregion
//#region src/main.js
function createRow(label, value) {
	return `
        <tr>
            <td class="label">${label}</td>
            <td>${value ? value.toUpperCase().trim() : ""}</td>
        </tr>
    `;
}
document.addEventListener("DOMContentLoaded", function() {
	renderHistory();
	document.querySelectorAll(".uppercase-input").forEach(function(input) {
		input.addEventListener("input", function() {
			this.value = this.value.toUpperCase();
		});
	});
	document.getElementById("historySearch").addEventListener("input", function() {
		renderHistory(this.value.toUpperCase());
	});
});
document.getElementById("verificationForm").addEventListener("submit", function(event) {
	event.preventDefault();
	const isEdit = document.querySelector("[type=\"submit\"]").getAttribute("data-id");
	saveRecord({
		id: isEdit || "REC_" + Date.now(),
		timestamp: (/* @__PURE__ */ new Date()).toLocaleString().toUpperCase(),
		oldName: document.getElementById("oldName").value.toUpperCase(),
		oldEpic: document.getElementById("oldEpic").value.toUpperCase(),
		oldRelative: document.getElementById("oldRelative").value.toUpperCase(),
		oldRelationship: document.getElementById("oldRelationship").value.toUpperCase(),
		oldDob: document.getElementById("oldDob").value.toUpperCase(),
		oldDistrict: document.getElementById("oldDistrict").value.toUpperCase(),
		oldAcNo: document.getElementById("oldAcNo").value.toUpperCase(),
		oldAcName: document.getElementById("oldAcName").value.toUpperCase(),
		oldPartNo: document.getElementById("oldPartNo").value.toUpperCase(),
		oldSlNo: document.getElementById("oldSlNo").value.toUpperCase(),
		personType: document.querySelector("input[name=\"personType\"]:checked").value.toUpperCase(),
		newName: document.getElementById("newName").value.toUpperCase(),
		newEpic: document.getElementById("newEpic").value.toUpperCase(),
		newRelative: document.getElementById("newRelative").value.toUpperCase(),
		newRelationship: document.getElementById("newRelationship").value.toUpperCase(),
		newDob: document.getElementById("newDob").value.toUpperCase(),
		newDistrict: document.getElementById("newDistrict").value.toUpperCase(),
		newAcNo: document.getElementById("newAcNo").value.toUpperCase(),
		newAcName: document.getElementById("newAcName").value.toUpperCase(),
		newPartNo: document.getElementById("newPartNo").value.toUpperCase(),
		newSlNo: document.getElementById("newSlNo").value.toUpperCase(),
		contact: document.getElementById("contact").value.toUpperCase()
	}, isEdit);
	this.reset();
	renderHistory();
});
document.getElementById("resetForm").addEventListener("click", function(event) {
	event.preventDefault();
	document.getElementById("verificationForm").reset();
	document.querySelector("[type=\"submit\"]").removeAttribute("data-id");
});
function saveRecord(record, isEdit) {
	let history = JSON.parse(localStorage.getItem("voterHistory")) || [];
	if (isEdit) {
		history = history.filter((item) => item.id !== isEdit);
		document.getElementById(isEdit).remove();
	}
	history.unshift(record);
	localStorage.setItem("voterHistory", JSON.stringify(history));
	document.querySelector("[type=\"submit\"]").removeAttribute("data-id");
}
function deleteRecord(id) {
	if (confirm("ARE YOU SURE YOU WANT TO DELETE THIS HISTORICAL LOG ENTRY?")) {
		let history = JSON.parse(localStorage.getItem("voterHistory")) || [];
		history = history.filter((item) => item.id !== id);
		localStorage.setItem("voterHistory", JSON.stringify(history));
		renderHistory(document.getElementById("historySearch").value.toUpperCase());
	}
}
function renderHistory(filterText = "") {
	const tbody = document.getElementById("historyBody");
	tbody.innerHTML = "";
	const filtered = (JSON.parse(localStorage.getItem("voterHistory")) || []).filter((item) => {
		if (!filterText) return true;
		return item.oldName.includes(filterText) || item.oldEpic.includes(filterText) || item.newName.includes(filterText) || item.newEpic.includes(filterText);
	});
	if (filtered.length === 0) {
		tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">NO RECORD ENTRIES FOUND MATCHING CRITERIA</td></tr>`;
		return;
	}
	filtered.forEach((item) => {
		const tr = document.createElement("tr");
		tr.setAttribute("id", item.id);
		tr.innerHTML = `
            <td>${item.timestamp}</td>
            <td><strong>${item.oldName}</strong><br><small>${item.oldEpic}</small></td>
            <td><strong>${item.newName || "N/A"}</strong><br><small>${item.newEpic || "N/A"}</small></td>
            <td>${item.personType}</td>
            <td>
                <button class="actionBtn print" >PRINT</button>
                <button class="actionBtn edit" >EDIT</button>
                <button class="actionBtn delete" >DELETE</button>
                <button class="actionBtn view" >PROGENY</button>
            </td>
        `;
		tbody.appendChild(tr);
		tr.querySelector(".print").onclick = () => printFromHistory(item);
		tr.querySelector(".edit").onclick = () => editRecord(item.id);
		tr.querySelector(".delete").onclick = () => deleteRecord(item.id);
		tr.querySelector(".view").onclick = () => addProgeny(item.id);
		tr.scrollIntoView();
	});
}
function addProgeny(id) {
	const record = JSON.parse(localStorage.getItem("voterHistory")).find((item) => item.id === id);
	if (!record) return;
	if (!window.confirm("Are you sure you want to add progeny of " + record.newName + "?")) return;
	document.getElementById("oldName").value = record.newName;
	document.getElementById("oldEpic").value = record.newEpic;
	document.getElementById("oldRelative").value = record.newRelative;
	document.getElementById("oldRelationship").value = record.newRelationship;
	document.getElementById("oldDob").value = record.newDob;
	document.getElementById("oldDistrict").value = record.newDistrict;
	document.getElementById("oldAcNo").value = record.newAcNo;
	document.getElementById("oldAcName").value = record.newAcName;
	document.getElementById("oldPartNo").value = record.newPartNo;
	document.getElementById("oldSlNo").value = record.newSlNo;
	document.getElementById("newRelative").value = record.newName;
	document.getElementById("newName").previousElementSibling.scrollIntoView();
	document.getElementById("newName").focus();
}
function editRecord(id) {
	const record = JSON.parse(localStorage.getItem("voterHistory")).find((item) => item.id === id);
	if (!record) return;
	document.getElementById("oldName").value = record.oldName;
	document.getElementById("oldEpic").value = record.oldEpic;
	document.getElementById("oldRelative").value = record.oldRelative;
	document.getElementById("oldRelationship").value = record.oldRelationship;
	document.getElementById("oldDob").value = record.oldDob;
	document.getElementById("oldDistrict").value = record.oldDistrict;
	document.getElementById("oldAcNo").value = record.oldAcNo;
	document.getElementById("oldAcName").value = record.oldAcName;
	document.getElementById("oldPartNo").value = record.oldPartNo;
	document.getElementById("oldSlNo").value = record.oldSlNo;
	document.getElementById("newName").value = record.newName;
	document.getElementById("newEpic").value = record.newEpic;
	document.getElementById("newRelative").value = record.newRelative;
	document.getElementById("newRelationship").value = record.newRelationship;
	document.getElementById("newDob").value = record.newDob;
	document.getElementById("newDistrict").value = record.newDistrict;
	document.getElementById("newAcNo").value = record.newAcNo;
	document.getElementById("newAcName").value = record.newAcName;
	document.getElementById("newPartNo").value = record.newPartNo;
	document.getElementById("newSlNo").value = record.newSlNo;
	document.getElementById("contact").value = record.contact;
	document.querySelector("input[name=\"personType\"][valueType=\"" + record.personType + "\"]").checked = true;
	document.querySelector("[type=\"submit\"]").setAttribute("data-id", id);
	document.getElementById("oldName").previousElementSibling.scrollIntoView();
	document.getElementById("oldName").focus();
}
function printFromHistory(record) {
	generatePrintPage(record);
}
function generatePrintPage(data) {
	const printWindow = window.open("", "_blank");
	if (!printWindow) {
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
//#endregion
