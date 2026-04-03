const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app'); // Assurez-vous que votre fichier app.js exporte l'instance express
const User = require('../models/users');
const Catway = require('../models/catways');
const bcrypt = require('bcrypt');

describe('Tests des Routes API Catways et Réservations', function() {
  // On augmente le timeout global des tests à 10s pour laisser le temps à la DB et au hachage
  this.timeout(10000);

  let token;
  let catwayId;
  let reservationId;

  // Avant les tests, on récupère un jeton JWT valide
  before(async () => {
    const testPassword = 'SuperSecurePassword1234';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    await User.findOneAndUpdate(
      { email: 'jane@doe.com' },
      { 
        name: 'Jane Doe', 
        password: hashedPassword 
      },
      { upsert: true }
    );

    // 2. On nettoie un éventuel catway restant d'un test précédent pour éviter le 409 (conflit)
    await Catway.deleteOne({ catwayNumber: 888 });

    // 3. Authentification
    const res = await request(app)
      .post('/authenticate')
      .set('Accept', 'application/json')
      .send({
        email: 'jane@doe.com',
        password: testPassword
      });
    token = res.body.token;

    if (!token) {
      throw new Error("Authentification échouée : Jeton non reçu. Vérifiez vos identifiants ou la connexion DB.");
    }
  });

  /**
   * SECTION : CATWAYS
   */

  // 1. POST /catways (Création)
  it('devrait créer un nouveau catway (POST /catways)', async () => {
    const res = await request(app)
      .post('/catways')
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`])
      .send({
        catwayNumber: 888,
        type: 'long',
        catwayState: 'Parfait état'
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    catwayId = res.body._id;
  });

  // 2. GET /catways (Liste)
  it('devrait récupérer la liste des catways (GET /catways)', async () => {
    const res = await request(app)
      .get('/catways')
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  // 3. GET /catways/:id (Détails)
  it('devrait récupérer un catway spécifique par son ID (GET /catways/:id)', async () => {
    const res = await request(app)
      .get(`/catways/${catwayId}`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(200);
    expect(res.body.catwayNumber).to.equal(888);
  });

  // 4. PUT /catways/:id (Modification)
  it('devrait modifier les informations d\'un catway (PUT /catways/:id)', async () => {
    const res = await request(app)
      .put(`/catways/${catwayId}`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`])
      .send({ catwayState: 'Besoin de nettoyage' });
    expect(res.status).to.equal(200);
    expect(res.body.catwayState).to.equal('Besoin de nettoyage');
  });

  /**
   * SECTION : RÉSERVATIONS
   */

  // 5. POST /catways/:id/reservations (Création réservation)
  it('devrait créer une réservation pour un catway (POST /catways/:id/reservations)', async () => {
    const res = await request(app)
      .post(`/catways/${catwayId}/reservations`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`])
      .send({
        clientName: 'Alice Maritime',
        boatName: 'L\'Insubmersible',
        checkIn: '2024-06-01',
        checkOut: '2024-06-10'
      });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('_id');
    reservationId = res.body._id;
  });

  // 6. GET /catways/:id/reservations (Liste réservations)
  it('devrait récupérer les réservations d\'un catway (GET /catways/:id/reservations)', async () => {
    const res = await request(app)
      .get(`/catways/${catwayId}/reservations`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  // 7. GET /catways/:id/reservations/:idReservation (Détail réservation)
  it('devrait récupérer les détails d\'une réservation (GET /catways/:id/reservations/:idRes)', async () => {
    const res = await request(app)
      .get(`/catways/${catwayId}/reservations/${reservationId}`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(200);
    expect(res.body.clientName).to.equal('Alice Maritime');
  });

  // 8. DELETE /catways/:id/reservations/:idReservation (Suppression réservation)
  it('devrait supprimer une réservation (DELETE /catways/:id/reservations/:idRes)', async () => {
    const res = await request(app)
      .delete(`/catways/${catwayId}/reservations/${reservationId}`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(204);
  });

  // 9. DELETE /catways/:id (Suppression catway)
  it('devrait supprimer un catway (DELETE /catways/:id)', async () => {
    const res = await request(app)
      .delete(`/catways/${catwayId}`)
      .set('Accept', 'application/json')
      .set('Cookie', [`token=${token}`]);
    expect(res.status).to.equal(204);
  });
});