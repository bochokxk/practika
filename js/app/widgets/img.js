export var img = {
  data:function(){
    return {
      value:""
    }
  },
  mounted(){
    if(this.modelValue && !this.modelValue.startsWith('data:')){
      this.value = this.$root.url+'/'+this.modelValue;
    }
  },
  methods: {
    change(event) {
      var self = this;
      var file = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function() {
        self.value = reader.result;
      };
      reader.readAsDataURL(file);

      this.$emit('update:modelValue', event.target.files[0]);
    }
  },
  props: {
    modelValue: String 
  },
  template:`
    <div class="image-preview-area">
      <a href="#" class="select_img" @click.prevent="$refs.input.click()">
        <span v-if="value">
          <img :src="value" class="im">
        </span>
        <span v-if="!value">
          <img :src="this.$root.url+'/app/views/images/placeholder.png'">
        </span>
      </a>
    </div>
    <input type="file" data-name="image" ref="input" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" @change="change($event)">
  `
};
