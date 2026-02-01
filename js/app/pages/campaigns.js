export const campaigns = {
  data: function() {
    return {
      parent: '',
      data: {},
      details: {},
      date: '',
      date2: '',
      q: '',
      sort: '',
      iChart: -1,
      loader: 1,
      id: 0,
      type: 0,
      all: true
    }
  },
  mounted: function(){
    this.parent = this.$root;
    
    if(!this.parent.user || !this.parent.user.auth){
      this.parent.logout();
    }
    this.get();
    this.GetFirstAndLastDate();



  },
  methods: {
    GetFirstAndLastDate: function(){
      var year = new Date().getFullYear();
      var month = new Date().getMonth();
      var firstDayOfMonth = new Date(year, month, 2);
      var lastDayOfMonth = new Date(year, month+1, 1);
      
      this.date = firstDayOfMonth.toISOString().substring(0, 10);
      this.date2 = lastDayOfMonth.toISOString().substring(0, 10);
    },
    get: function(){
      var self = this;
      var data = self.parent.toFormData(self.parent.formData);
      if(this.date1="") data.append('date',this.date);
      if(this.date2!="") data.append('date2',this.date2);
      
      self.loader=1;
      axios.post(this.parent.url+"/site/getCampaigns?auth="+this.parent.user.auth,data).then(function(response){
        self.data = response.data;
        self.loader = 0;
        if(self.iChart!=-1) self.line(self.data.items[self.iChart]);
      }).catch(function(error){
        self.parent.logout();
      });
    },
    action: function(){
      var self = this;
      self.parent.formData.copy = "";
      var data = self.parent.toFormData(self.parent.formData);
      
      axios.post(this.parent.url+"/site/actionCampaign?auth="+this.parent.user.auth,data).then(function(response){
        self.$refs.new.active=0;
        if(self.parent.formData.id){
          self.$refs.header.$refs.msg.successFun("Successfully updated campaign!");
        }else{
          self.$refs.header.$refs.msg.successFun("Successfully added new campaign!");
        }
        self.get();
      }).catch(function(error){
        self.parent.logout();
      });
    },
    del: async function () {
      if(await this.$refs.header.$refs.msg.confirmFun("Please confirm next action","Do you want to delete this campaign?")){
        var self = this;
        var data = self.parent.toFormData(self.parent.formData);

        axios.post(this.parent.url+"/site/deleteCampaign?auth="+this.parent.user.auth,data)
        .then(function(response){
          if(response.data.error){
            self.$refs.header.$refs.msg.alertFun(response.data.error);
          } else {
            self.$refs.header.$refs.msg.successFun("Successfully deleted campaign!");
            self.get();
          }
        })
        .catch(function(error){
          console.log('errors : ',error);
        });
      }
    },
    checkAll: function(prop){
      if(this.parent.formData && this.parent.formData.sites){
        for(let i in this.parent.formData.sites){
          this.parent.formData.sites[i].include = prop;
        }
      }
      this.getCampaignChart();
    },
    getCampaignChart:function(){

      var self = this;
      var data = self.parent.toFormData(self.parent.formData);
      if(this.date!="") data.append('date',this.date);
      if(this.date2!="") data.append('date2',this.date2);
      if(this.q!="") data.append('q',this.q);
      if(this.sort!="") data.append('sort',this.sort);
      
      self.loader=1;
      axios.post(this.parent.url+"/site/getCampaignChart?auth="+this.parent.user.auth,data).then(function(response){
        var totalViews = 0;
        var totalClicks = 0;
        var totalLeads = 0;
        if(response.data.items && response.data.items.line){
          for(var k in response.data.items.line){
            var row = response.data.items.line[k];
            totalViews += parseFloat(row.views || 0);
            totalClicks += parseFloat(row.clicks || 0);
            totalLeads += parseFloat(row.leads || 0);
          }
        }
        self.parent.formData.views = response.data.items.views ?? totalViews;
        self.parent.formData.clicks = response.data.items.clicks ?? totalClicks;
        self.parent.formData.leads = response.data.items.leads ?? totalLeads;
        /*if(response.data.items.leads) self.parent.formData.leads = response.data.items.leads;
        if(response.data.items.fclicks) self.parent.formData.fclicks = response.data.items.fclicks;*/
        self.parent.formData.line = response.data.items.line;
        self.parent.formData.sites = response.data.items.sites;
        self.line(response.data.items);
        self.loader = 0;
      }).catch(function(error){
        console.log(error);
        self.parent.logout();
      });

    },
    line: function(item){
      setTimeout(function(){
        let dates = [];
        let clicks = [];
        let views = [];
        let leads = [];
        if(item && item['line']){
          for(let i in item['line']){
              dates.push(i);
            //if(item[i].include=='true'){
              clicks.push(item['line'][i].clicks);
              views.push(item['line'][i].views);
              leads.push(item['line'][i].leads);
            //}
          }
        }
        //console.log(clicks,views);

        document.getElementById('chartOuter').innerHTML = '<div id="chartHints"><div class="chartHintsViews">Views</div><div class="chartHintsClicks">Clicks</div></div><canvas id="myChart"></canvas>';
        const ctx = document.getElementById('myChart');
        const xScaleImage = {
          id:'xScaleImage',
          afterDatasetsDraw(chart,args,plugins){
            const {ctx,data, chartArea:{bottom}, scales:{x}} = chart;
            ctx.save();
            data.images.forEach((image, index) => {
              const label = new Image();
              label.src = image;

              const width = 120;
              ctx.drawImage(label,x.getPixelForValue(index)-(width/2 ),x.top,width,width);
            });
          }
        };

        new Chart(ctx, {
          type: 'line',
          //plugins: [xScaleImage],

          data: {
            labels: dates,
            //images:images,
            datasets: [
              {
                label: "Clicks",
                backgroundColor: "#005990",
                borderColor: "#005990",
                data: clicks
              },
              {
                label: "Views",
                backgroundColor: "#500088",
                borderColor: "#500088",
                data: views,
                yAxisID: 'y2'
              }
            ]
          },
          options: {
            responsive: true,
            plugins:{
              tooltip: {
                bodyFontSize: 20,
                usePointStyle:true,
                callbacks: {
                  title: (ctx) => {
                    return ctx[0]['dataset'].label
                  },
                }
              },
              legend:{
                display:false
              }
            },
            categoryPercentage :0.2,
            barPercentage: 0.8,
            //barThickness: 30,
            scales:{
              y: {
                id: 'y2',
                position: 'right'
              },x:{
                afterFit: (scale) => {
                  display: true,
                  scale.height = 120;
                }
              }
            }
          }
        });
      }, 100);
    },
  },
  template: `
    <div class="inside-content">
      <Header ref="header" />
      <div id="spinner" v-if="loader"></div>
      <div class="wrapper">
        <div class="flex panel">
          <div class="w20 ptb30">
            <h1>Campaigns</h1>
          </div>
          <div class="w60 ptb20 ac"><input type="date" v-model="date" @change="get()" /> - <input type="date" v-model="date2" @change="get()" />
          </div>
          <div class="w20 al ptb20">
            <a class="btns" href="#" @click.prevent="parent.formData={};$refs.new.active=1"><i class="fas fa-plus"></i> New</a>
          </div>
        </div>

        <popup ref="new" :title="(parent.formData && parent.formData.id) ? 'Edit campaign' : 'New campaign'">
          <div class="form inner-form">
            <form @submit.prevent="action()" v-if="parent.formData">
              <div class="row">
                <label>Name</label>
                <input type="text" v-model="parent.formData.title" required>
              </div>

              <div class="row">
                <button class="btn" v-if="parent.formData && parent.formData.id">Edit</button>
                <button class="btn" v-if="parent.formData && !parent.formData.id">Add</button>
              </div>
            </form>
          </div>
        </popup>

        <popup ref="chart" fullscreen="true" title="Chart">
          <div v-if="parent.formData && parent.formData.id">
            <div class="flex panel">
              <div class="w30 ptb25"><input type="date" v-model="date" @change="getCampaignChart();" /> - <input type="date" v-model="date2" @change="getCampaignChart();" /></div>
              <div class="w70 al">
                <div class="fil_cubes">
                  <div class="w30 clicks">
                    <div>Clicks</div>
                    {{parent.formData.clicks || 0}}
                  </div>
                  <div class="w30 views">
                    <div>Views</div>
                    {{parent.formData.views || 0}}
                  </div>
                  <div class="w30 leads">
                    <div>Leads</div>
                    {{parent.formData.leads || 0}}
                  </div>
                  <div class="w30 ctr">
                    <div>CTR</div>
                    {{parent.formData.views ? (parent.formData.clicks*100/parent.formData.views).toFixed(2) : 0}} %
                  </div>
                </div>
              </div>
            </div>

            <div class="flex body">
              <div class="w30 ar filchart">
                <div class="itemchart ptb10" v-if="all">
                  <toogle v-model="all" @update:modelValue="all = $event;checkAll($event)" />
                  All
                </div>
                <div class="itemchart ptb10" v-if="parent.formData.sites" v-for="s in parent.formData.sites">
                  <toogle v-model="s.include" @update:modelValue="s.include = $event;getCampaignChart();" />
                  {{s.site}}
                </div>
              </div>
              <div class="w70" id="chartOuter">
                <div id="chartHints">
                  <div class="chartHintsViews">Views</div>
                  <div class="chartHintsClicks">Clicks</div>
                </div>
                <canvas id="myChart"></canvas>
              </div>
            </div>
          </div>
        </popup>
        
        <div class="table" v-if="data.items!==''">
          <table>
            <thead>
              <tr>
                <th class="id">Actions</th>
                <th class="id">Fraud clicks</th>
                <th class="id">Leads</th>
                <th class="id">Clicks</th>
                <th class="id">Views</th>
                <th>Title</th>
                <th class="id"></th>
                <th class="id">#</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item,i) in data.items">
                <td class="actions">
                  <a :href="'#/campaign/'+item.id">
                    <i class="fas fa-edit"></i>
                  </a>
                  <a href="#" @click.prevent="parent.formData = JSON.parse(JSON.stringify(item));iChart = i;$refs.chart.active=1;getCampaignChart()">
                    <i class="fas fa-chart-bar"></i>
                  </a>
                  <a href="#" @click.prevent="parent.formData = item;del()">
                    <i class="fas fa-trash-alt"></i>
                  </a>
                </td>
                <td class="id">
                  <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,4)">
                    <template v-if="item.fclicks">{{item.fclicks}}</template>
                    <template v-if="!item.fclicks">0</template>
                  </a>
                </td>
                <td class="id">
                  <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,3)">
                    <template v-if="item.leads">{{item.leads}}</template>
                    <template v-if="!item.leads">0</template>
                  </a>
                </td>
                <td class="id">
                  <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,2)">
                    <template v-if="item.clicks">{{item.clicks}}</template>
                    <template v-if="!item.clicks">0</template>
                  </a>
                </td>
                <td class="id">
                  <a href="#" @click.prevent="$refs.details.active=1;getDetails(item.id,1)">{{item.views}}</a>
                </td>
                <td><a :href="'#/campaign/'+item.id">{{item.title}}</a></td>
                <td class="id">
                  <toogle v-model="item.published" @update:modelValue="parent.formData = item;action();"></toogle>
                </td>
                <td class="id">{{item.id}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="empty" v-if="data.items===''">
          No items
        </div>
      </div>
    </div>
  `
};
