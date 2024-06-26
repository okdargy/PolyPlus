const UserID = JSON.parse(window.localStorage.getItem('p+account_info')).ID;
const BodyColors = [
	'#f8f8f8',
	'#cdcdcd',
	'#111111',
	'#ff0000',
	'#a34b4b',
	'#ffc9c9',
	'#957977',
	'#c4281c',
	'#da867a',
	'#694028',
	'#cc8e69',
	'#a05f35',
	'#7c5c46',
	'#eab892',
	'#da8541',
	'#aa5500',
	'#ffcc99',
	'#e29b40',
	'#ffaf00',
	'#ffb000',
	'#d7c59a',
	'#f5cd30',
	'#fdea8d',
	'#e5e4df',
	'#c1be42',
	'#ffff00',
	'#ffffcc',
	'#a4bd47',
	'#7f8e64',
	'#a1c48c',
	'#3a7d15',
	'#4b974b',
	'#00ff00',
	'#ccffcc',
	'#27462d',
	'#287f47',
	'#789082',
	'#9ff3e9',
	'#12eed4',
	'#f2f3f3',
	'#00ffff',
	'#008f9c',
	'#04afec',
	'#80bbdb',
	'#b4d2e4',
	'#0d69ac',
	'#1b2a35',
	'#afddff',
	'#6e99ca',
	'#74869d',
	'#2154b9',
	'#002060',
	'#0000ff',
	'#b1a7ff',
	'#a3a2a5',
	'#6225d1',
	'#b480ff',
	'#8c5b9f',
	'#6b327c',
	'#aa00aa',
	'#635f62',
	'#ff00bf',
	'#ff66cc',
	'#e8bac8'
];

let PageContainer = document.querySelector('.container.p-0.p-lg-5');
let ItemGrid;
let Wearing;
let Tabs;
let IFrame;
let TabSelected = 'hat';
let Search;
let Page = 1;
let Avatar = {
	useCharacter: true,
	items: [24122],
	shirt: 24118,
	pants: 24123,
	headColor: '#e0e0e0',
	torsoColor: '#e0e0e0',
	leftArmColor: '#e0e0e0',
	rightArmColor: '#e0e0e0',
	leftLegColor: '#e0e0e0',
	rightLegColor: '#e0e0e0'
};

if (new URLSearchParams(window.location.search).has('sandbox')) {
	console.log('Avatar Sandbox!');

	LoadFile(chrome.runtime.getURL('resources/avatar-sandbox.html'), function (html) {
		PageContainer.innerHTML = html;
		ItemGrid = document.getElementById('inventory');
		Wearing = document.getElementById('wearing');
		Tabs = document.getElementById('tabs');
		IFrame = document.getElementById('viewFrame');

		Search = document.getElementById('item-search');
		Search.addEventListener('onchange', function () {
			RefreshItems();
		});

		UpdateAvatar();
		RefreshItems();
		LoadWearing();

		Array.from(Tabs.children).forEach((element) => {
			element.addEventListener('click', function () {
				let Link = element.getElementsByTagName('a')[0];
				if (!Link.classList.contains('active')) {
					Link.classList.add('active');
					Tabs.querySelector(`[data-tab="${TabSelected}"]`).classList.remove('active');
					TabSelected = Link.getAttribute('data-tab');
					Page = 1;
					RefreshItems();
				}
			});
		});

		let Clear = document.getElementById('clear');
		Clear.addEventListener('click', function () {
			Avatar = {
				useCharacter: true,
				items: [24122],
				shirt: 24118,
				pants: 24123,
				headColor: '#e0e0e0',
				torsoColor: '#e0e0e0',
				leftArmColor: '#e0e0e0',
				rightArmColor: '#e0e0e0',
				leftLegColor: '#e0e0e0',
				rightLegColor: '#e0e0e0'
			};
			UpdateAvatar();
		});

		let Myself = document.getElementById('myself');
		Myself.addEventListener('click', function () {
			LoadMyself();
		});

		let JSONUpload = document.getElementById('jsonUpload');
		JSONUpload.addEventListener('change', function () {
			let Reader = new FileReader();
			Reader.addEventListener('loadend', function () {
				Avatar = JSON.parse(Reader.result);
				UpdateAvatar();

				JSONUpload.value = '';
			});

			Reader.readAsText(JSONUpload.files[0]);
		});

		let JSONSave = document.getElementById('jsonSave');
		JSONSave.addEventListener('click', function () {
			let Download = document.createElement('a');
			Download.href = URL.createObjectURL(
				new Blob([JSON.stringify(Avatar)], {
					type: 'application/json'
				})
			);
			Download.setAttribute('download', 'AvatarSandbox.json');
			document.body.appendChild(Download);
			Download.click();
			document.body.removeChild(Download);
		});

		let OpenInNewTab = document.getElementById('openNewTab');
		OpenInNewTab.addEventListener('click', function () {
			UpdateAvatar();
		});

		let LoadAsset = document.getElementById('load-asset');
		const LoadAssetType = document.getElementById('load-asset-type')
		LoadAsset.addEventListener('click', async function () {
			if (!LoadAsset.previousElementSibling.value.startsWith('http') && !LoadAsset.previousElementSibling.value.startsWith('data:')) {
				if (LoadAssetType.options[LoadAssetType.selectedIndex].value === 'hat') {
					Avatar.items.push((await (await fetch('https://api.polytoria.com/v1/assets/serve-mesh/' + LoadAsset.previousElementSibling.value)).json()).url);
				} else {
					Avatar[LoadAssetType.options[LoadAssetType.selectedIndex].value] = (await (await fetch('https://api.polytoria.com/v1/assets/serve/' + LoadAsset.previousElementSibling.value + '/Asset')).json()).url;
				}
			} else {
				if (LoadAssetType.options[LoadAssetType.selectedIndex].value === 'hat') {
					Avatar.items.push(LoadAsset.previousElementSibling.value);
				} else {
					Avatar[LoadAssetType.options[LoadAssetType.selectedIndex].value] = LoadAsset.previousElementSibling.value
				}
			}
			UpdateAvatar();
		});
	});
} else {
	const SandboxButton = document.createElement('a');
	SandboxButton.classList = 'btn btn-outline-success w-100 mt-3';
	SandboxButton.href = '?sandbox=true';
	SandboxButton.innerHTML = '<i class="fas fa-shirt"></i> Avatar Sandbox';
	document.getElementById('cont-move').parentElement.appendChild(SandboxButton);
}

function UpdateAvatar() {
	FormatAvatar().then((hash) => {
		IFrame.addEventListener('load', function () {
			IFrame.src = 'https://polytoria.com/ptstatic/itemview/#' + hash;
		});
		IFrame.src = 'about:blank';
	});
}

function LoadFile(path, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		return callback(this.responseText);
	};
	xhr.open('GET', path, true);
	xhr.send();
}

async function GenerateHash(data) {
	if (!data) {
		console.log('Data not provided');
		let FormattedAvatar = await FormatAvatar();
		return btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)));
	} else {
		console.log('Data provided');
		return btoa(encodeURIComponent(JSON.stringify(data)));
	}
}

function RefreshItems() {
	fetch(`https://api.polytoria.com/v1/store?search=${Search.value}&types%5B%5D=${TabSelected}&sort=createdAt&order=desc&page=${Page}&limit=12`)
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then((data) => {
			Array.from(ItemGrid.children).forEach((element) => {
				element.remove();
			});
			data = data.assets;
			data.forEach((item) => {
				let NewItemCard = document.createElement('div');
				NewItemCard.setAttribute('data-id', item.id);
				NewItemCard.classList = 'col-auto';
				NewItemCard.innerHTML = `
                <div style="max-width: 150px;">
                    <div class="card mb-2 avatar-item-container">
                        <div class="p-2">
                            <img src="${item.thumbnail}" class="img-fluid">
                            <span class="position-absolute" style="top: 5px; left: 5px; z-index: 1;">
                                <span class="badge bg-secondary">${item.type.charAt(0).toUpperCase() + item.type.substring(1)}</span>
                            </span>
                            <button class="avatarAction btn btn-success btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-plus"></i></button>
                        </div>
                    </div>
                    <a href="/store/${item.id}" class="text-reset">
                        <h6 class="text-truncate mb-0">${item.name}</h6>
                    </a>
                    <small class="text-muted d-block text-truncate">
                        by <a href="/users/${item.creator.id}" class="text-reset">${item.creator.name}</a>
                    </small>
                </div>
                `;
				NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function () {
					WearAsset(NewItemCard, item);
				});

				ItemGrid.appendChild(NewItemCard);
			});
		})
		.catch((error) => {
			console.error('Fetch error:', error);
		});
}

async function FormatAvatar() {
	const FormattedAvatar = structuredClone(Avatar);

	// Hats, Tools: https://api.polytoria.com/v1/assets/serve-mesh/:id
	// or: https://api.polytoria.com/v1/assets/serve/:id/Asset

	const meshPromises = Avatar.items.map(async (item, index) => {
		if (typeof item === 'number') {
			console.log(item);
			FormattedAvatar.items[index] = await FetchMesh(item)
			console.log('after url');
			//Avatar.items[index] = URL
		}
	});

	Avatar.items.forEach(async (item, index) => {
		if (typeof item === 'number') {
			console.log(item);
			FetchMesh(item)
				.then((URL) => {
					console.log('URL: ' + URL);
					FormattedAvatar.items[index] = URL;
				})
				.catch((error) => {
					throw new Error(error);
				});
			console.log('after url');
			//Avatar.items[index] = URL
		}
	});

	if (typeof FormattedAvatar.tool === 'number') {
		console.log(FormattedAvatar.tool);
		FormattedAvatar.tool = await FetchMesh(FormattedAvatar.tool);
	}

	if (FormattedAvatar.face === undefined) { FormattedAvatar.face = 'https://c0.ptacdn.com/static/3dview/DefaultFace.png'; }
	if (FormattedAvatar.face && typeof FormattedAvatar.face === 'number') {
		FormattedAvatar.face = await FetchAsset(FormattedAvatar.face);
	} else if (FormattedAvatar.face === undefined) {
		FormattedAvatar.face = 'https://c0.ptacdn.com/static/3dview/DefaultFace.png';
	}

	if (typeof FormattedAvatar.shirt === 'number') {
		FormattedAvatar.shirt = await FetchAsset(FormattedAvatar.shirt);
	}
	if (typeof FormattedAvatar.pants === 'number') {
		FormattedAvatar.pants = await FetchAsset(FormattedAvatar.pants);
	}
	
	await Promise.all(meshPromises)

	console.log('Real Avatar: ', Avatar)
	console.log('Formatted: ', FormattedAvatar)
	console.log('URI: ', btoa(encodeURIComponent(JSON.stringify(FormattedAvatar))))
	console.log('Fix: ', JSON.stringify(decodeURIComponent(atob(btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)))))));
	return btoa(encodeURIComponent(JSON.stringify(FormattedAvatar)));
}

function LoadMyself() {
	fetch('https://api.polytoria.com/v1/users/:id/avatar'.replace(':id', UserID))
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network not ok');
			}
			return response.json();
		})
		.then((data) => {
			Avatar.items = [];

			data.assets.forEach((item) => {
				switch (item.type) {
					case 'hat':
						Avatar.items.push(item.id);
						break;
					default:
						Avatar[item.type] = item.id;
						break;
				}
			});

			Avatar.headColor = '#' + data.colors.head || '#cdcdcd';
			Avatar.torsoColor = '#' + data.colors.torso || '#cdcdcd';
			Avatar.leftArmColor = '#' + data.colors.leftArm || '#cdcdcd';
			Avatar.rightArmColor = '#' + data.colors.rightArm || '#cdcdcd';
			Avatar.leftLegColor = '#' + data.colors.leftLeg || '#cdcdcd';
			Avatar.rightLegColor = '#' + data.colors.rightLeg || '#cdcdcd';

			UpdateAvatar();
		})
		.catch((error) => {
			console.log(error);
		});
}

function WearAsset(element, info) {
	if (Avatar.items.indexOf(info.id) === -1 && Avatar[info.type] !== info.id) {
		console.log('Equip', info);
		switch (info.type) {
			case 'hat':
				Avatar.items.push(info.id);
				break;
			default:
				Avatar[info.type] = info.id;
				break;
		}
	} else {
		console.log('unequip', info);
		switch (info.type) {
			case 'hat':
				Avatar.items.splice(Avatar.items.indexOf(info.id), 1);
				break;
			case 'face':
				Avatar.face = 'https://c0.ptacdn.com/static/3dview/DefaultFace.png';
				break;
			default:
				Avatar[info.type] = undefined;
				break;
		}
	}

	const ToggleButton = element.getElementsByClassName('avatarAction')[0];
	ToggleButton.classList.toggle('btn-success');
	ToggleButton.classList.toggle('btn-danger');
	ToggleButton.children[0].classList.toggle('fa-plus');
	ToggleButton.children[0].classList.toggle('fa-minus');

	const Duplicate = ItemGrid.querySelector(`[data-id="${info.id}"]`);
	if (Duplicate !== null && Duplicate !== element) {
		const DuplicateToggleButton = Duplicate.getElementsByClassName('avatarAction')[0];
		DuplicateToggleButton.classList.toggle('btn-success');
		DuplicateToggleButton.classList.toggle('btn-danger');
		DuplicateToggleButton.children[0].classList.toggle('fa-plus');
		DuplicateToggleButton.children[0].classList.toggle('fa-minus');
	}

	LoadWearing();
	UpdateAvatar();
}

async function FetchMesh(id) {
	if (id === null) {
		return null;
	}
	console.log('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', id));

	return new Promise((resolve, reject) => {
		fetch('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', id))
			.then((response) => {
				if (!response.ok) {
					throw new Error('Network not ok');
				}
				return response.json();
			})
			.then((data) => {
				console.log(data, 'finished', data.url);
				resolve(data.url);
			})
			.catch((error) => {
				console.log('Fetch error: ' + error);
			});
	})
	return fetch('https://api.polytoria.com/v1/assets/serve-mesh/:id'.replace(':id', id))
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network not ok');
			}
			return response.json();
		})
		.then((data) => {
			console.log(data, 'finished', data.url);
			return data.url;
		})
		.catch((error) => {
			console.log('Fetch error: ' + error);
		});
}

async function FetchAsset(id) {
	if (id === null) {
		return null;
	}
	return fetch('https://api.polytoria.com/v1/assets/serve/:id/Asset'.replace(':id', id))
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network not ok');
			}
			return response.json();
		})
		.then((data) => {
			return data.url;
		})
		.catch((error) => {
			console.log('Fetch error: ' + error);
		});
}

function LoadWearing() {
	const WearingItems = [...Avatar.items, Avatar.shirt, Avatar.pants, Avatar.face].filter((item) => item !== null && item !== undefined);

	Array.from(Wearing.children).forEach((element) => {
		const ItemID = element.getElementsByTagName('a')[0].href.split('/')[2];
		if (!WearingItems.includes(ItemID)) {
			element.remove();
		}
	});

	WearingItems.forEach((item) => {
		const ExistingElement = Wearing.querySelector(`[data-itemid="${item}"]`);

		if (!ExistingElement) {
			fetch(`https://api.polytoria.com/v1/store/${item}`)
				.then((response) => {
					if (!response.ok) {
						throw new Error('Network not ok');
					}
					return response.json();
				})
				.then((item) => {
					if (Wearing.innerHTML === 'No items to show.') {
						Wearing.innerHTML = '';
					}
					let NewItemCard = document.createElement('div');
					NewItemCard.setAttribute('data-id', item.id);
					NewItemCard.classList = 'col-auto';
					NewItemCard.innerHTML = `
                    <div style="max-width: 150px;">
                        <div class="card mb-2 avatar-item-container">
                            <div class="p-2">
                                <img src="${item.thumbnail}" class="img-fluid">
                                <span class="position-absolute" style="top: 5px; left: 5px; z-index: 1;">
                                    <span class="badge bg-secondary">${item.type.charAt(0).toUpperCase() + item.type.substring(1)}</span>
                                </span>
                                <button class="avatarAction btn btn-danger btn-sm position-absolute rounded-circle text-center" style="top: -10px; right: -16px; width: 32px; height: 32px; z-index: 1;"><i class="fas fa-minus"></i></button>
                            </div>
                        </div>
                        <a href="/store/${item.id}" class="text-reset">
                            <h6 class="text-truncate mb-0">${item.name}</h6>
                        </a>
                        <small class="text-muted d-block text-truncate">
                            by <a href="/users/${item.creator.id}" class="text-reset">${item.creator.name}</a>
                        </small>
                    </div>
                    `;
					Wearing.appendChild(NewItemCard);
					NewItemCard.getElementsByClassName('p-2')[0].addEventListener('click', function () {
						WearAsset(NewItemCard, item);
					});
				})
				.catch((error) => {
					console.log('Fetch error: ' + error);
				});
		}
	});

	if (Array.from(Wearing.children).length === 0) {
		Wearing.innerHTML = 'No items to show.';
	}
}
