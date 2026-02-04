export const payments = {
	data:function() {
		return {
			parent:'',
			data:{},
			loader:1
		}
	},
	mounted:function(){
		this.parent = this.$root;
		
		if(!this.parent.user || !this.parent.user.auth){
			this.parent.logout();
			return;
		}

		this.get();
	},
	methods:{
		get:function(){
			var self = this;
			var data = self.parent.toFormData(self.parent.formData);
			data.append('id',this.parent.user.id);
			self.loader=1;
			axios.post(this.parent.url+"/site/getPayments?auth="+this.parent.user.auth,data).then(function(response){
				if(response.data.error){
					self.$refs.header.$refs.msg.alertFun(response.data.error);
					self.loader=0;
				} else {
					self.loader=0;
					self.data = response.data;
				}
			}).catch(function(error){
				console.log('errors : ',error);
				self.loader=0;
			});
		},
	},
	template:`
	<div class="inside-content">
		<Header ref="header" />
		<div id="spinner" v-if="loader"></div>
		<div class="wrapper">
			<div class="flex panel">
				<div class="w30 ptb10">
					<h2>Payments</h2>
				</div>
				<div class="w50"></div>
				<div class="w20 ptb15 al">
					
				</div>
			</div>
		</div>

		<popup ref="payment" :title="'Payment'">
			<div class="form inner-form">
				<form v-if="parent.formData">
					<div class="row">
						<label>Value</label>
						<input type="text" v-model="parent.formData.value" placeholder="Value" required />
					</div>

					<div class="row">
						<label>Date</label>
						<input type="date" v-model="parent.formData.date_title" required />
					</div>

					<div class="row">
						<label>Description</label>
						<textarea v-model="parent.formData.description" placeholder="Description"></textarea>
					</div>

					<div class="row">
						<button class="btn" @click.prevent="action()">Save</button>
					</div>
				</form>
			</div>
		</popup>

		<div class="wrapper">
			<div class="table" v-if="data.items!=''">
				<table>
					<thead>
						<tr>
							<th>Description</th>
							<th>Date</th>
							<th class="id">Value</th>
							<th class="id">#</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in data.items">
							<td>
								{{item.description}}
							</td>
							<td>
								<a href="#" @click.prevent="parent.formData = item;$refs.payment.active=1;">
									{{item.date_title}}
								</a>
							</td>
							<td class="id">
								<a href="#" @click.prevent="parent.formData = item;$refs.payment.active=1;">
									{{item.value}}
								</a>
							</td>
							
							<td class="id">{{item.id}}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div class="empty" v-if="data.items==''">
				No items
			</div>
		</div>
	</div>
	`
}
