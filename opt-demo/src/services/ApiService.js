import axios from "axios";

export default class ApiService {
    // Base URL for the API
    static BASE_URL = "http://localhost:8090/api";


        // services/ApiService.js
    static saveUserId(userId) {
        localStorage.setItem('userId', userId);
    }

    static getUserId() {
        return localStorage.getItem('userId');
    }


    static saveToken(token) {
        localStorage.setItem("token", token);
    }

    static getToken() {
        return localStorage.getItem("token");
    }

    //save role
    static saveRole(roles) {
        localStorage.setItem("roles", JSON.stringify(roles));
    }

    // Get the roles from local storage
    static getRoles() {
        const roles = localStorage.getItem('roles');
        return roles ? JSON.parse(roles) : null;
    }

    // Check if the user has a specific role
    static hasRole(role) {
        const roles = this.getRoles();
        return roles ? roles.includes(role) : false;
    }

    // Check if the user is an admin
    static isAdmin() {
        return this.hasRole('ADMIN');
    }

    // Check if the user is an instructor
    static isCustomer() {
        return this.hasRole('CUSTOMER');
    }

    static logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("roles");
    }

    static isAuthenticated() {
        const token = this.getToken();
        return !!token;
    }

    static getHeader() {
        const token = this.getToken();
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    }

    // REGISTER USER
    static async registerUser(registrationData) {
        const resp = await axios.post(`${this.BASE_URL}/auth/register`, registrationData);
        return resp.data;
    }


    static async loginUser(loginData) {
        const resp = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
        return resp.data;
    }

    static async getCustomersByPtId() {
        const resp = await axios.get(`${this.BASE_URL}/users/listAllCustomers`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getUserProfileById(userId) {
        const resp = await axios.get(`${this.BASE_URL}/users/${userId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getPendingCustomers() {
        const resp = await axios.get(`${this.BASE_URL}/users/listByPending`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getUserStatus(userId) {
        const resp = await axios.get(`${this.BASE_URL}/users/user-status/${userId}`, { headers: this.getHeader() });
        return resp.data;
    }
        static async setUserStatus(userId, newStatus) {
            // Backend'in beklediği UpdateStatusDTO nesnesini oluşturuyoruz.
            const updateStatusDTO = {
                id: userId,
                status: newStatus
            };

            const resp = await axios.put(`${this.BASE_URL}/users/update-user-status`, updateStatusDTO, { headers: this.getHeader() });
            return resp.data;
        }

    // DÜZELTİLDİ: Backend'deki @RequestParam'a uygun metot
    static async updatePtPhoneNumberAndStatus(phoneNumber) {
        const resp = await axios.put(`${this.BASE_URL}/users/updateStatus?phoneNumber=${phoneNumber}`, null, { headers: this.getHeader() });
        return resp.data;
    }

    // YENİ: Bekleyen müşterileri getirme metodu
    static async getPendingCustomers() {
        const resp = await axios.get(`${this.BASE_URL}/users/listByPending`, { headers: this.getHeader() });
        return resp.data;
    }

    // YENİ: Müşteriyi onaylama metodu
    static async approvePendingCustomer(customerId) {
        const resp = await axios.put(`${this.BASE_URL}/users/approve/${customerId}`, null, { headers: this.getHeader() });
        return resp.data;
    }

    // YENİ: Müşteriyi reddetme metodu
    static async rejectPendingCustomer(customerId) {
        const resp = await axios.put(`${this.BASE_URL}/users/reject/${customerId}`, null, { headers: this.getHeader() });
        return resp.data;
    }
    

    /**USERS PROFILE MANAGEMENT SESSION */
    static async myProfile() {
        const resp = await axios.get(`${this.BASE_URL}/users/account`, {
            headers: this.getHeader()
        })
        return resp.data;
    }


    static async updateProfile(formData) {
        const resp = await axios.put(`${this.BASE_URL}/users/update`, formData, {
            headers: {
                ...this.getHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return resp.data;
    }


    static async deactivateProfile() {
        const resp = await axios.delete(`${this.BASE_URL}/users/deactivate`, {
            headers: this.getHeader()
        });
        return resp.data;
    }

    // Appointment API
    static async createAppointment(appointmentRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/appointment/createAppointment`, appointmentRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }
    static async getAppointmentByDateAndStartTime(date, startTime){
            const response = await axios.get(`${this.BASE_URL}/appointment/getAppointment`, {
                params: {
                    date: date,
                    startTime: startTime
                }
            });
            return response.data;
        }

        static async getAppointmentsByCustomerId(customerId){
            const resp = await axios.get(`${this.BASE_URL}/appointment/${customerId}`, { headers: this.getHeader() });
            return resp.data;
        }

    static async cancelAppointment(appointmentId) {
        const resp = await axios.put(`${this.BASE_URL}/appointment/cancel/${appointmentId}`, null, { headers: this.getHeader() });
        return resp.data;
    }

    static async deleteAppointment(appointmentId) {
        const resp = await axios.delete(`${this.BASE_URL}/appointment/delete/${appointmentId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getAppointmentNotesByAppointmentId(appointmentId) {
        const resp = await axios.get(`${this.BASE_URL}/appointment/getNotes/${appointmentId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async createAppointmentNote(appointmentNoteRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/appointment/createNote`, appointmentNoteRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async deleteAppointmentNote(appointmentNoteId) {
        const resp = await axios.delete(`${this.BASE_URL}/appointment/deleteNote/${appointmentNoteId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async updateAppointmentNote(appointmentNoteRequestDTO) {
        const resp = await axios.put(`${this.BASE_URL}/appointment/updateNote`, appointmentNoteRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    // Meal API
    static async createMeal(mealRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/meal/create`, mealRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async getOwnMeal(mealRequestDTO) {
        const resp = await axios.get(`${this.BASE_URL}/meal/get`, {
        headers: this.getHeader(),
        params: {
            ptId: mealRequestDTO.ptId,       // Eksik olan parametre
            customerId: mealRequestDTO.customerId,
            date: mealRequestDTO.date
        }
    });
    return resp.data;
    }

    static async getOwnMeals(mealRequestDTO) {
        const resp = await axios.get(`${this.BASE_URL}/meal/getMeals`, {
        headers: this.getHeader(),
        params: {
            ptId: mealRequestDTO.ptId,
            customerId: mealRequestDTO.customerId,
        }
    });
    return resp.data;
    }

    static async deleteMeal(id) {
        const resp = await axios.delete(`${this.BASE_URL}/meal/delete/${id}`, { headers: this.getHeader() });
        return resp.data;
    }

    // MealItem API
    static async createMealItem(mealItemRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/mealitem/create`, mealItemRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async updateMealItem(mealItemRequestDTO) {
        const resp = await axios.put(`${this.BASE_URL}/mealitem/update`, mealItemRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async getMealItemById(id) {
        const resp = await axios.get(`${this.BASE_URL}/mealitem/getById/${id}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getMealItemsByMealId(mealId) {
        const resp = await axios.get(`${this.BASE_URL}/mealitem/getAll/${mealId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async deleteMealItem(id) {
        const resp = await axios.delete(`${this.BASE_URL}/mealitem/delete/${id}`, { headers: this.getHeader() });
        return resp.data;
    }

    // Workout API
    static async createWorkout(workoutRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/workout`, workoutRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async getOwnWorkout(workoutRequestDTO) {
    const resp = await axios.get(`${this.BASE_URL}/workout/all`, {
        headers: this.getHeader(),
        params: {
            ptId: workoutRequestDTO.ptId,       // Eksik olan parametre
            customerId: workoutRequestDTO.customerId,
            date: workoutRequestDTO.date
        }
    });
    return resp.data;
}

    static async getOwnWorkouts(workoutRequestDTO) {
    const resp = await axios.get(`${this.BASE_URL}/workout/getWorkouts`, {
        headers: this.getHeader(),
        params: {
            ptId: workoutRequestDTO.ptId,       // Eksik olan parametre
            customerId: workoutRequestDTO.customerId
        }
    });
    return resp.data;
}

    static async deleteWorkout(id) {
        const resp = await axios.delete(`${this.BASE_URL}/workout/${id}`, { headers: this.getHeader() });
        return resp.data;
    }

    // WorkoutExercise API
    static async createWorkoutExercise(workoutExerciseRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/workoutexercises/create`, workoutExerciseRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async updateWorkoutExercise(workoutExerciseRequestDTO) {
        const resp = await axios.put(`${this.BASE_URL}/workoutexercises/update`, workoutExerciseRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }



    static async getWorkoutExerciseById(id) {
        const resp = await axios.get(`${this.BASE_URL}/workoutexercises/getById/${id}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getWorkoutExercisesByWorkoutId(workoutId) {
        const resp = await axios.get(`${this.BASE_URL}/workoutexercises/getAll/${workoutId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async deleteWorkoutExercise(id) {
        const resp = await axios.delete(`${this.BASE_URL}/workoutexercises/delete/${id}`, { headers: this.getHeader() });
        return resp.data;
    }
    
    // Availability API
    static async createAvailability(availabilityRequestDTO) {
        const resp = await axios.post(`${this.BASE_URL}/availability`, availabilityRequestDTO, { headers: this.getHeader() });
        return resp.data;
    }

    static async getAvailabilitiesByAccessable() {
        const resp = await axios.get(`${this.BASE_URL}/availability/accessible`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getAllAvailabilities() {
        const resp = await axios.get(`${this.BASE_URL}/availability/all`, { headers: this.getHeader() });
        return resp.data;
    }

    static async deleteAvailability(availabilityId) {
        const resp = await axios.delete(`${this.BASE_URL}/availability/${availabilityId}`, { headers: this.getHeader() });
        return resp.data;
    }

    static async makeAccessableTrue(availabilityId) {
        const resp = await axios.put(`${this.BASE_URL}/availability/makeTrue/${availabilityId}`, null, { headers: this.getHeader() });
        return resp.data;
    }
    
    static async makeAccessableFalse(availabilityId) {
        const resp = await axios.put(`${this.BASE_URL}/availability/makeFalse/${availabilityId}`, null, { headers: this.getHeader() });
        return resp.data;
    }

    static async getAvailabilitiesByDate(availabilityRequestDTO) {
        const resp = await axios.get(`${this.BASE_URL}/availability/date`, {
        headers: this.getHeader(),
        params: {
            ptId: availabilityRequestDTO.ptId,
            date: availabilityRequestDTO.date
        }
    });
    return resp.data;
    }
    
    // Payment API
    static async initializePayment(id) {
        const resp = await axios.post(`${this.BASE_URL}/payments/pay/${id}`, null, { headers: this.getHeader() });
        return resp.data;
    }

    static async updatePaymentStatus(paymentRequest) {
        const resp = await axios.put(`${this.BASE_URL}/payments/update`, paymentRequest, { headers: this.getHeader() });
        return resp.data;
    }

    static async getAllPayments() {
        const resp = await axios.get(`${this.BASE_URL}/payments/all`, { headers: this.getHeader() });
        return resp.data;
    }

    static async getPaymentById(paymentId) {
        const resp = await axios.get(`${this.BASE_URL}/payments/${paymentId}`, { headers: this.getHeader() });
        return resp.data;
    }
}
