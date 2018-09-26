// Other techniques for learning
class ActivationFunction {
    constructor(func, dfunc) {
        this.func = func;
        this.dfunc = dfunc;
    }
}

let sigmoid = new ActivationFunction(
    x => 1 / (1 + Math.exp(-x)),
    y => y * (1 - y)
);

let tanh = new ActivationFunction(
    x => Math.tanh(x),
    y => 1 - (y * y)
);


class NeuralNetwork {
    /*
    * if first argument is a NeuralNetwork the constructor clones it
    * USAGE: cloned_nn = new NeuralNetwork(to_clone_nn);
    */
    constructor(in_nodes, hid_nodes, out_nodes) {
        if (in_nodes instanceof NeuralNetwork) {
            let a = in_nodes;
            this.input_nodes = a.input_nodes;
            this.hidden_nodes = a.hidden_nodes;
            this.output_nodes = a.output_nodes;

            this.weights_ih = a.weights_ih.copy();
            this.weights_ho = a.weights_ho.copy();

            this.bias_h = a.bias_h.copy();
            this.bias_o = a.bias_o.copy();
        } else {
            this.input_nodes = in_nodes;
            this.hidden_nodes = hid_nodes;
            this.output_nodes = out_nodes;

            this.weights_ih = new Matrix(this.hidden_nodes, this.input_nodes);
            this.weights_ho = new Matrix(this.output_nodes, this.hidden_nodes);
            this.weights_ih.randomize();
            this.weights_ho.randomize();

            this.bias_h = new Matrix(this.hidden_nodes, 1);
            this.bias_o = new Matrix(this.output_nodes, 1);
            this.bias_h.randomize();
            this.bias_o.randomize();
        }

        // TODO: copy these as well
        this.setLearningRate();
        this.setActivationFunction();


    }

    predict(input_array) {

        // Generating the Hidden Outputs
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(this.activation_function.func);

        // Generating the output's output!
        let output = Matrix.multiply(this.weights_ho, hidden);
        output.add(this.bias_o);
        output.map(this.activation_function.func);

        // Sending back to the caller!
        return output.toArray();
    }

    predictSoftMax(input_array) {
        let pred = this.predict(input_array);
        let ee = pred.map(Math.exp);
        let esum = ee.reduce(function (a, b) { return a + b; });
        return ee.map(function (a) { return a / esum });
    }

    setLearningRate(learning_rate = 0.1) {
        this.learning_rate = learning_rate;
    }

    setActivationFunction(func = sigmoid) {
        this.activation_function = func;
    }

    train(input_array, target_array) {
        // Generating the Hidden Outputs
        let inputs = Matrix.fromArray(input_array);
        let hidden = Matrix.multiply(this.weights_ih, inputs);
        hidden.add(this.bias_h);
        // activation function!
        hidden.map(this.activation_function.func);

        // Generating the output's output!
        let outputs = Matrix.multiply(this.weights_ho, hidden);
        outputs.add(this.bias_o);
        outputs.map(this.activation_function.func);

        // Convert array to matrix object
        let targets = Matrix.fromArray(target_array);

        // Calculate the error
        // ERROR = TARGETS - OUTPUTS
        let output_errors = Matrix.subtract(targets, outputs);

        // let gradient = outputs * (1 - outputs);
        // Calculate gradient
        let gradients = Matrix.map(outputs, this.activation_function.dfunc);
        gradients.multiply(output_errors);
        gradients.multiply(this.learning_rate);


        // Calculate deltas
        let hidden_T = Matrix.transpose(hidden);
        let weight_ho_deltas = Matrix.multiply(gradients, hidden_T);

        // Adjust the weights by deltas
        this.weights_ho.add(weight_ho_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_o.add(gradients);

        // Calculate the hidden layer errors
        let who_t = Matrix.transpose(this.weights_ho);
        let hidden_errors = Matrix.multiply(who_t, output_errors);

        // Calculate hidden gradient
        let hidden_gradient = Matrix.map(hidden, this.activation_function.dfunc);
        hidden_gradient.multiply(hidden_errors);
        hidden_gradient.multiply(this.learning_rate);

        // Calcuate input->hidden deltas
        let inputs_T = Matrix.transpose(inputs);
        let weight_ih_deltas = Matrix.multiply(hidden_gradient, inputs_T);

        this.weights_ih.add(weight_ih_deltas);
        // Adjust the bias by its deltas (which is just the gradients)
        this.bias_h.add(hidden_gradient);

        // outputs.print();
        // targets.print();
        // error.print();
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        if (typeof data == 'string') {
            data = JSON.parse(data);
        }
        let nn = new NeuralNetwork(data.input_nodes, data.hidden_nodes, data.output_nodes);
        nn.weights_ih = Matrix.deserialize(data.weights_ih);
        nn.weights_ho = Matrix.deserialize(data.weights_ho);
        nn.bias_h = Matrix.deserialize(data.bias_h);
        nn.bias_o = Matrix.deserialize(data.bias_o);
        nn.learning_rate = data.learning_rate;
        return nn;
    }

    static breed(n1, n2) {
        if (n1.input_nodes != n2.input_nodes || n1.hidden_nodes != n2.hidden_nodes || n1.output_nodes != n2.output_nodes) {
            print("NN can't breed");
            return null;
        }
        let nn = n1.copy();

        nn.weights_ih.map((e, row, col) => (random() > 0.5) ? n1.weights_ih.data[row][col] : n2.weights_ih.data[row][col]);
        nn.weights_ho.map((e, row, col) => (random() > 0.5) ? n1.weights_ho.data[row][col] : n2.weights_ho.data[row][col]);

        nn.bias_h.map((e, row, col) => (random() > 0.5) ? n1.bias_h.data[row][col] : n2.bias_h.data[row][col]);
        nn.bias_o.map((e, row, col) => (random() > 0.5) ? n1.bias_o.data[row][col] : n2.bias_o.data[row][col]);
        return nn;
    }


    static breed2(n1, n2) {
        if (n1.input_nodes != n2.input_nodes || n1.hidden_nodes != n2.hidden_nodes || n1.output_nodes != n2.output_nodes) {
            print("NN can't breed");
            return null;
        }
        let nn = n1.copy();
        this.mutate(nn.weights_ih, n1.weights_ih, n2.weights_ih);
        this.mutate(nn.weights_ho, n1.weights_ho, n2.weights_ho);
        this.mutate(nn.bias_h, n1.bias_h, n2.bias_h);
        this.mutate(nn.bias_o, n1.bias_o, n2.bias_o);

        return nn;
    }

    static mutate(mm, m1, m2) {
        let c = floor(random(mm.cols));
        let r = floor(random(mm.rows));
        mm.map((e, row, col) =>
            (row < r || (row == r && col < c)) ? m1.data[row][col] : m2.data[row][col]);

    }

    // Adding function for neuro-evolution
    copy() {
        return new NeuralNetwork(this);
    }

    // Accept an arbitrary function for mutation
    mutate(func) {
        this.weights_ih.map(func);
        this.weights_ho.map(func);
        this.bias_h.map(func);
        this.bias_o.map(func);
    }

}

if (typeof module !== 'undefined') {
    module.exports = NeuralNetwork;
}