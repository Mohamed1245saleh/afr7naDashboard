<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" :type="alert.type" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="بحث"
            single-line
            hide-details
        ></v-text-field>
    </v-toolbar>
    <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        :search="search"
        hide-actions
        :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
            <td class="text-xs-right"  v-if="props.item.name">{{ props.item.name }}</td>
            <td class="text-xs-right" v-else>لا يوجد مسمى</td>
            <td class="text-xs-right"  v-if="props.item.email">{{ props.item.email }}</td>
            <td class="text-xs-right" v-else>لا يوجد مسمى</td>
            <td class="text-xs-right"  v-if="props.item.phone">{{ props.item.phone }}</td>
            <td class="text-xs-right" v-else>لا يوجد مسمى</td>
            <td class="text-xs-right">
              <img v-if="props.item.image"  :src="$root.$data.baseURL+props.item.image" :ref="'user_'+props.item.id" @error="imageFallBack(props.item.id)" alt="صورة المستخدم" title="صورة المستخدم" width="50px" height="50px" style="cursor:pointer" @click="() => {image = props.item.image;mdialog = true;}">
              
              <img v-else  src="@/assets/avatar.png" alt="صورة المستخدم" title="صورة المستخدم" width="50px" height="50px" style="cursor:pointer" >
            </td>
            <td class="justify-right layout px-0">
                <v-btn v-if="props.item.status" :loading="disapprove" small flat color="red" @click="dialog = true;user = props.item" >
                  ايقاف
                  <v-icon class="red--text"  >
                      not_interested
                  </v-icon>
                </v-btn>
                <v-btn v-else :loading="approve" small flat color="green" @click="restoreItem(props.item)" >
                  استرجاع
                  <v-icon class="green--text"  >
                      restore
                  </v-icon>
                </v-btn>
                
            </td>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
            لا يوجد نتائج للبحث "{{search}}"
        </v-alert>
        <template slot="pageText" slot-scope="props">
          الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="success" icon="warning" outline>
            لا يوجد مستخدمين
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="primary" v-model="pagination.page" :length="pages"></v-pagination>
    </div>
    <v-dialog
      v-if="image"
      v-model="mdialog"
      width="600"
      style="max-height:400px;overflow:hidden"
    >
    <v-card v-if="image" :style="'background-image:url(\'http://souq24app.com/'+image+'\');'" id="card-image">
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title  class="title red--text">متأكد من إيقاف المستخدم؟</v-card-title>

        <v-card-text>
          <v-checkbox color="red" label="حذف المستخدم نهائيا" v-model="forceDelete"></v-checkbox>        
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="grey darken-1"
            flat="flat"
            @click="dialog = false"
          >
            لا
          </v-btn>

          <v-btn
            color="red darken-1"
            flat="flat"
            @click="deleteItem"
          >
            نعم
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</div>
</template>

<script>
export default {
  props:{
    title:{
      default: '',
      type: String
    },
    icon:{
      default: '',
      type: String
    }
  },
  data: () => ({
    forceDelete:false,
    image: null,
    errors:[],
    user: null,
    edit:false,
    dialog:false,
    mdialog:false,
    imagesdialog:false,
    requests:[],
    totalRequests:0,
    pagination: {},
    search: '',
    loading: false,
    disapprove: false,
    approve: false,
    headers: [
      {
        text: 'الاسم',
        align: 'right',
        sortable: false
      },
      {
        text: 'البريد الاليكترونى',
        align: 'right',
        sortable: false
      },
      {
        text: 'رقم الهاتف',
        align: 'right',
        sortable: false
      },
      {
        text: 'الصورة',
        align: 'right',
        sortable: false
      },
      {
        text: 'عمليات',
        align: 'right',
        value: 'actions',
        sortable: false
      }
    ],
    alert: {
      message: '',
      type: 'success'
    },
    page:1
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        if(!this.loading) {

          this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
        }
      },
      deep: true
    }
  },
  created () {
    if(!this.loading)
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
  },
  methods: {
    getDataFromApi (res = null) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination
        if(res != null){
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          setTimeout(() => {
            this.loading = false
          }, 300);
          resolve({
            items,
            total
          })
        }
        else {
          const endpoint = (this.search.replace(/\s/g, '').length>0)?'api/admin/users/search/' + this.search :'api/admin/users?page=' + page
        this.$http.get(endpoint)
        .then( (res) => {
           
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          setTimeout(() => {
            this.loading = false
          }, 300);
          resolve({
            items,
            total
          })
        })
      }
      })
    },
    selectImage () {
      document.getElementById('image_choose').click()
    },
    imageFallBack(id){
      this.$refs[`user_${id}`].src = '../assets/avatar.png'
    },
    deleteItem (item) {
      this.disapprove = true
      const forceDelete = this.forceDelete == true ? 1:0
        this.$http.delete('api/admin/users/'+ this.user.id+ '?forceDelete='+ forceDelete+'&page=' + this.page)
        .then( res => {
           
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          // this.requests.splice(index, 1)
          this.alert.message = forceDelete == 1 ? 'تم حذف المستخدم!' : 'تم إيقاف المستخدم!ّ'
          this.alert.type = 'info'
          this.dialog = false 
          this.disapprove = false
        })
    },

    restoreItem (item) {
      this.approve = true
      // const index = this.requests.indexOf(item)
      if(confirm('هل تود استرجاع المستخدم؟')) {
      const forceDelete = this.forceDelete == true ? 1:0
        this.$http.post('api/admin/users/'+ item.id+ '/restore'+'?page=' + this.page)
        .then( res => {
           
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          // this.requests.splice(index, 1)
          this.alert.message = 'تم استئناف المستخدم'
          this.alert.type = 'success'
          this.approve = false
        })
      }else{
        this.approve = false
      }
    },

    close () {
      this.dialog = false
    }
  }
}
</script>

<style scoped>
  ul{
    list-style: none;
    background-size: contain;
  }
  #card-image{
    height:400px;
    width:600px;
    background-size: cover;
    background-repeat: no-repeat
  }
</style>
