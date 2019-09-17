<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
            <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon>إضافة باقة</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">{{formTitle}}</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                      <ul>
                        <li v-for="err in error" :key="err + Math.random()">
                          {{err}}
                        </li>
                      </ul>
                    </li>
                  </ul>
                </v-card-text>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex>
                              <v-text-field v-model="packageItem.title" label="الاسم" />
                              <v-text-field v-model="packageItem.price"  label="السعر" />
                              <v-text-field v-model="packageItem.duration"  label="المدة" />
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">الغاء</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save">حفظ</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
    <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        hide-actions
        :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
            <td class="text-xs-right"  v-if="props.item.id">{{ props.item.id }}</td>
            <td class="text-xs-right"  v-if="props.item.title">{{ props.item.title }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.price">{{ props.item.price }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.duration">{{ props.item.duration }}</td>
            <td class="text-xs-right" v-else>--</td>
            <td class="justify-right layout px-0">
                <v-btn small flat color="blue" @click="editing(props.item)"> 
                  تعديل
                  <v-icon  class="mr-2 blue--text" >
                      edit
                  </v-icon>
                </v-btn>
                <v-btn :loading="disapprove" small flat color="red" @click="deleteItem(props.item)">
                  مسح
                  <v-icon class="red--text"  >
                      delete
                  </v-icon>
                </v-btn>  
            </td>
        </template>
        <v-alert slot="no-results" :value="true" color="success" icon="warning" outline>
            لا يوجد
        </v-alert>
        <template slot="pageText" slot-scope="props">
          الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="success" icon="warning" outline>
            لا يوجد
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="blue" v-model="pagination.page" :length="pages"></v-pagination>
    </div>
    <v-dialog
      v-model="deleteDialog"
      max-width="290"
    >
      <v-card>
        <v-card-title  class="title red--text">هل تريد تعطيل الباقة؟</v-card-title>

        <v-card-text>
          <v-checkbox color="red" label="حذف الباقة نهائيا" v-model="forceDelete"></v-checkbox>        
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
  props: {
    title: {
      default: "",
      type: String
    },
    icon: {
      default: "",
      type: String
    }
  },
  data: () => ({
    errors: [],
    packageItem: {
      id: null,
      title: null,
      price: null,
      date_time: null,
    },
    edit: false,
    dialog: false,
    deleteDialog: false,
    forceDelete: false,
    selectedItem: null,
    requests: [],
    totalRequests: 0,
    pagination: {rowsPerPage: 10},
    search: "",
    loading: false,
    disapprove: false,
    approve: false,
    headers: [
      {
        text: "id",
        align: "right",
        value: "title",
        sortable: false
      },
      {
        text: "الاسم",
        align: "right",
        value: "title",
        sortable: false
      },
      {
        text: "السعر (دينار)",
        align: "right",
        value: "price",
        sortable: false
      },
      {
        text: "المدة (ساعة)",
        align: "right",
        value: "duration",
        sortable: false
      },
      {
        text: " ",
        align: "right",
        sortable: false
      }
    ],
    editedItem: null,
    alert: {
      message: "",
      type: "success"
    },
    page: 1,
    index: null,
    filterCategory: null,
    categories: []
  }),

  computed: {
    formTitle(){
      return (this.edit) ? 'تعديل الباقة' : 'إضافة باقة';
    },
    pages() {
      if (
        this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      )
        return 0;
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },

  watch: {
    dialog(val) {
      if (!val) {
        this.packageItem = {
          id: null,
          title: null,
          title_en: null,
          Phone_key: null
        };
      }
      val || this.close();
    },
    pagination: {
      handler() {
        this.page = this.pagination.page;
        if (this.loading) return;
        this.getDataFromApi().then(data => {
          this.requests = data.items;
          this.totalRequests = data.total;
        });
      },
      deep: true
    }
  },
  created() {
    if (this.loading) return;
    this.getDataFromApi().then(data => {
      this.requests = data.items;
      this.totalRequests = data.total;
    });
  },
  methods: {
    getDataFromApi(res = null) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination;
        if (res != null) {
          let items = res.data.data;
          const total = res.data.total;
          this.pagination.totalItems = res.data.total;
          this.loading = false;
          resolve({
            items,
            total
          });
        } else {
          const endpoint = `api/admin/packages?page=${page}&country=${this.$ls.get('country_id')}` ;
          this.$http.get(endpoint).then(res => {
            let items = res.data.packages.data;
            const total = res.data.packages.total;
            this.pagination.totalItems = res.data.packages.total;
            this.loading = false;
            resolve({
              items,
              total
            });
          });
        }
      });
    },
    deleteItem(item) {
      if(!confirm('مسح الباقة؟')) return;
      const index = this.requests.indexOf(item)
      this.disapprove = true;
      this.$http
        .delete("api/admin/packages/" + item.id)
        .then(res => {
          this.requests.splice(index, 1)
          this.alert.message =  "تم حذف الباقة!";
          this.alert.type = "info";
          this.forceDelete = false;
        })
        .finally(() => {
          this.disapprove = false;
          this.deleteDialog = false;
        });
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = -1;
      }, 300);
    },
    editing(item) {
      this.dialog = !this.dialog;
      this.edit = true;
      this.packageItem = Object.assign({}, item);
      this.index = this.requests.indexOf(item)
    },
    save() {
      const index = this.index
      if (this.edit) {
        this.$http
          .put(
            "api/admin/packages/" +
              this.packageItem.id +
              "?page=" +
              this.page,
            this.packageItem
          )
          .then(res => {
            this.$set(this.requests, index, this.packageItem)
            this.alert.type = "warning";
            this.alert.message = "تم تعديل الباقة!";
            this.close();
            this.errors = [];
            this.packageItem = {
              id: null,
              title: null,
              price: null,
              duration: null
            };
          })
          .catch(({ response }) => {
            this.errors = response.data.errors;
          });
      } else {
        this.packageItem.country_id=this.$ls.get('country_id')
        this.$http
          .post("api/admin/packages" + "?page=" + this.page, this.packageItem)
          .then(res => {
            this.requests.push(res.data.package)
            this.alert.type = "info";
            this.alert.message = "تم اضافة الباقة!";
            this.close();
            this.errors = [];
            this.packageItem = {
              id: null,
              title: null,
              price: null,
              duration: null
            };
          })
          .catch(({ response }) => {
            this.errors = response.data.errors;
          });
      }
    }
  }
};
</script>

<style scoped>
ul {
  list-style: none;
}
</style>
