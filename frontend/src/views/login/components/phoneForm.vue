<template>
	<el-form ref="loginForm" :model="form" :rules="rules" label-width="0" size="large" @keyup.enter="login">
		<el-form-item prop="phone">
			<el-input v-model="form.phone" prefix-icon="el-icon-iphone" clearable placeholder="请输入手机号">
				<template #prepend>+86</template>
			</el-input>
		</el-form-item>
		<el-form-item prop="yzm"  style="margin-bottom: 35px;">
			<div class="login-msg-yzm">
				<el-input v-model="form.yzm" prefix-icon="el-icon-unlock" clearable placeholder="请输入验证码"></el-input>
				<el-button @click="getYzm" :disabled="disabled">获取验证码<span v-if="disabled"> ({{time}})</span></el-button>
			</div>
		</el-form-item>
		<el-form-item>
			<el-button type="primary" style="width: 100%;" :loading="islogin" round @click="login">登录</el-button>
		</el-form-item>
		<div class="login-reg">
			还没有账号？ <router-link to="/user_register">创建账号</router-link>
		</div>
	</el-form>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					phone: "",
					yzm: "",
				},
				rules: {
					phone: [
						{required: true, message: '请输入手机号'}
					],
					yzm: [
						{required: true, message: '请输入验证码'}
					]
				},
				disabled: false,
				time: 0,
				islogin: false,
			}
		},
		mounted() {

		},
		methods: {
			async getYzm(){
				var validate = await this.$refs.loginForm.validateField("phone").catch(()=>{})
				if(!validate){ return false }

				this.$message.success('验证码已发送')
				this.disabled = true
				this.time = 60
				var t = setInterval(() => {
					this.time -= 1
					if(this.time < 1){
						clearInterval(t)
						this.disabled = false
						this.time = 0
					}
				},1000)
			},
			async login(){
				var validate = await this.$refs.loginForm.validate().catch(()=>{})
				if(!validate){ return false }
			}
		}
	}
</script>

<style>

</style>
