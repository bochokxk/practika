export const users = {
	data:function() {
		return {
			parent:'',
			data:{},
			loader:1,
			type:0,
			uid:-1
		}
	},
	mounted:function(){
		this.parent = this.$root;

		if(!this.parent.user || !this.parent.user.auth){
			this.parent.logout();
		}

		this.get();
	},
	methods:{
		get:function(){
			var self = this;
			var data = self.parent.toFormData(self.parent.formData);
			if(this.type!='') data.append('type',this.type);
			self.loader=1;
			axios.post(this.parent.url+'/site/getUsers?auth='+this.parent.user.auth,data).then(function(response){
				if(response.data.error){
					self.$refs.header.$refs.msg.alertFun(response.data.error);
					self.loader=0;
				} else {
					self.data = response.data;
					self.loader=0;
					if(response.data.types && response.data.types[0] && !self.type) self.type = response.data.types[0].id;
				}
			}).catch(function(error){
				self.parent.logout();
			});
		},
		action:function(){
			var self = this;
			var data = self.parent.toFormData(self.parent.formData);

			axios.post(this.parent.url+'/site/actionUser?auth='+this.parent.user.auth,data).then(function(response){
				if(response.data.error){
					self.$refs.header.$refs.msg.alertFun(response.data.error);
				} else {
					self.$refs.new.active=0;
					if(self.parent.formData.id){
						self.$refs.header.$refs.msg.successFun("Successfully updated user!");
					}else{
						self.$refs.header.$refs.msg.successFun("Successfully added new user!");
					}
					self.get();
				}
			}).catch(function(error){
				self.parent.logout();
			});
		},
		del:async function () {
			if(await this.$refs.header.$refs.msg.confirmFun("Please confirm next action","Do you want to delete this user?")){
				var self = this;
				var data = self.parent.toFormData(self.parent.formData);

				axios.post(this.parent.url+'/site/deleteUser?auth='+this.parent.user.auth,data).then(function(response){
					if(response.data.error){
						self.$refs.header.$refs.msg.alertFun(response.data.error);
					} else {
						self.$refs.header.$refs.msg.successFun("Successfully deleted user!");
						self.get();
					}
				}).catch(function(error){
					console.log('errors : ',error);
				});
			}
		},
		copy:async function(text){
			if(navigator && navigator.clipboard){
				await navigator.clipboard.writeText(text);
				this.$refs.copy.active=0;
				this.$refs.header.$refs.msg.successFun("Successfully copied!");
				this.parent.formData={};
			}else{
				this.$refs.header.$refs.msg.alertFun("Use https!");
			}
		}
	},
	template:`
	<div class="inside-content">
		<Header ref="header" />
		<div id="spinner" v-if="loader"></div>
		<div class="wrapper">
			<div class="flex panel">
				<div class="w10 ptb30">
					<h1>Users</h1>
				</div>
				<div class="w70"></div>
				<div class="w20 al ptb20">
					<a class="btns" href="#" @click.prevent="parent.formData={};$refs.new.active=1"><i class="fas fa-plus"></i> New</a>
				</div>
			</div>
		</div>

		<popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit user' : 'New user'">
			<div class="form inner-form">
				<form @submit.prevent="action()" v-if="parent.formData">
					<div class="row">
						<label>Name</label>
						<input type="text" v-model="parent.formData.user" required>
					</div>
					<div class="row">
						<label>Phone</label>
						<input type="text" v-model="parent.formData.phone" required>
					</div>
					<div class="row">
						<label>Email</label>
						<input type="text" v-model="parent.formData.email" required>
					</div>
					<div class="row">
						<label>Password</label>
						<input type="text" v-model="parent.formData.password" >
					</div>

					<div class="row">
						<button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
						<button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
					</div>
				</form>
			</div>
		</popup>

		<popup ref="copy" :title="'Copy banner'">
			<div class="form inner-form">
				<form v-if="parent.formData">
					<div class="row">
						<label>Code</label>
						<textarea v-model="parent.formData.copy" style="width: 100%; height: 300px; min-height: 300px; resize: vertical; font-family: monospace;"></textarea>
					</div>

					<div class="row">
						<label>Type</label>
						<select v-model="type" @change="get()" required>
							<option value="0">---</option>
							<option v-if="data.types" v-for="c in data.types" :value="c.id">{{c.title}}</option>
						</select>
					</div>

					<div class="row">
						<button class="btn" @click.prevent="copy(parent.formData.copy)">Copy code</button>
					</div>
				</form>
			</div>
		</popup>

		<div class="wrapper">
			<div class="table" v-if="data.items && data.items.length>0">
				<table>
					<thead>
						<tr>
							<th class="actions">Actions</th>
							<th>Email</th>
							<th>Phone</th>
							<th>Name</th>
							<th class="id">Status</th>
							<th class="id">#</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="(item,i) in data.items">
							<td class="actions">
								<router-link :to="'/user/'+item.id">
									<i class="fas fa-edit"></i>
								</router-link>
								<a href="#" @click.prevent="parent.formData.copy = item.multi;uid=i;$refs.copy.active=1;">
									<i class="fas fa-images"></i>
								</a>
								<a href="#" @click.prevent="parent.formData = item;del();">
									<i class="fas fa-trash-alt"></i>
								</a>
							</td>
							<td>{{item.email}}</td>
							<td>{{item.phone}}</td>
							<td>
								<router-link :to="'/user/'+item.id">{{item.user}}</router-link>
							</td>
							<td class="id">
								<toogle :modelValue="item.published" @update:modelValue="item.published = $event;parent.formData = item;action()"></toogle>
							</td>
							<td class="id">{{item.id}}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="empty" v-else>
				No items
			</div>
		</div>
	</div>
	`
}
