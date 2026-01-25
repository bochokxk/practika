export const header = {
  data: function () {
    return {
      user: 0,
      parent: '',
      active: 0,
      menus: 0
    }
  },
  watch: {
  },
  mounted() {
    this.parent = this.$parent.$parent.$parent.$parent;
  },
  methods: {
  
  },
  template: `
    <header class="header">
      <msg ref="msg"/>
    </header>
  `
};
